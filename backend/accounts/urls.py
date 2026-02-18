from django.urls import path
from .views import RegisterView, GoogleLoginView, UserProfileUpdateView, google_callback
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/google/', GoogleLoginView.as_view(), name='google_login'),
    path('google/callback/', google_callback, name='google_callback'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/update/', UserProfileUpdateView.as_view(), name='profile_update'),
]
