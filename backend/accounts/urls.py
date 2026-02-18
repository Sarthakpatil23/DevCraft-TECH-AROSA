from django.urls import path
from .views import RegisterView, GoogleLoginView, UserProfileUpdateView, google_callback, test_oauth_view
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/google/', GoogleLoginView.as_view(), name='google_login'),
    path('google/callback/', google_callback, name='google_callback'),  # New callback endpoint
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/update/', UserProfileUpdateView.as_view(), name='profile_update'),
    path('test-oauth/', test_oauth_view, name='test_oauth'),  # Test OAuth page
]
