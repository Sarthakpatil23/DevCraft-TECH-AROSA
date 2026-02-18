from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.contrib.auth import login
from allauth.socialaccount.models import SocialAccount
from .serializers import RegisterSerializer, UserSerializer, UserProfileUpdateSerializer
from .models import UserProfile
import requests
import urllib.parse

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class GoogleLoginView(views.APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate token with Google UserInfo endpoint (using Access Token from frontend)
        try:
            google_response = requests.get(f'https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}')
            if google_response.status_code != 200:
                return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)
            
            user_data = google_response.json()
            email = user_data.get('email')
            name = user_data.get('name', '')
            picture = user_data.get('picture', '')
            google_sub = user_data.get('sub') # Google ID

            # Get or Create User
            # We use email as username for consistency
            user, created = User.objects.get_or_create(username=email, defaults={'email': email, 'first_name': name})
            
            # Debug logging
            print(f"Google Login: email={email}, created={created}, user_id={user.id}")
            
            # If created, set dummy password and profile info
            if created:
                user.set_unusable_password() 
                user.save()
                # Profile is auto-created by signal, fetch it
                profile = user.profile
                profile.picture = picture
                profile.google_id = google_sub
                profile.save()
                print(f"New user profile created")
            else:
                # Update existing user's profile info
                try:
                    profile = user.profile
                    if not profile.google_id:
                        profile.google_id = google_sub
                    if not profile.picture:
                        profile.picture = picture
                    profile.save()
                    print(f"Existing user profile updated")
                except:
                    print(f"Error updating existing user profile")

            # Check if user has completed onboarding (filled profile fields)
            profile = user.profile
            has_completed_onboarding = bool(profile.state and profile.gender and profile.dob)
            print(f"Has completed onboarding: {has_completed_onboarding}")

            tokens = get_tokens_for_user(user)
            return Response({
                'tokens': tokens,
                'user': UserSerializer(user).data,
                'is_new_user': not has_completed_onboarding  # Send to onboarding if profile incomplete
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileUpdateView(generics.UpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileUpdateSerializer
    
    def get_object(self):
        return self.request.user.profile


# Custom callback view for Google OAuth handled by Django
def google_callback(request):
    """
    This view is called after successful Google OAuth.
    It generates JWT tokens and redirects to frontend with the tokens.
    """
    user = request.user
    
    if not user.is_authenticated:
        # OAuth failed, redirect to login
        return redirect('http://127.0.0.1:8000/?error=auth_failed')
    
    print(f"OAuth Callback: user={user.email}, id={user.id}")
    
    # Get or create profile
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=user)
    
    # Check if user has completed onboarding
    has_completed_onboarding = bool(profile.state and profile.gender and profile.dob)
    print(f"Has completed onboarding: {has_completed_onboarding}")
    
    # Generate JWT tokens
    tokens = get_tokens_for_user(user)
    
    # Redirect directly to the appropriate frontend page with tokens
    if has_completed_onboarding:
        redirect_url = f"/dashboard?access_token={tokens['access']}&refresh_token={tokens['refresh']}"
    else:
        redirect_url = f"/onboarding?access_token={tokens['access']}&refresh_token={tokens['refresh']}"
    
    print(f"Redirecting to: {redirect_url}")
    return redirect(redirect_url)
