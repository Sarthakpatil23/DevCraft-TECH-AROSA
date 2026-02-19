from django.urls import path
from .views import (
    RegisterView, GoogleLoginView, UserProfileUpdateView,
    UserProfileDetailView, FullProfileUpdateView, google_callback,
    DocumentListCreateView, DocumentDetailView, DocumentDownloadView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/google/', GoogleLoginView.as_view(), name='google_login'),
    path('google/callback/', google_callback, name='google_callback'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/update/', UserProfileUpdateView.as_view(), name='profile_update'),
    path('profile/', UserProfileDetailView.as_view(), name='profile_detail'),
    path('profile/full-update/', FullProfileUpdateView.as_view(), name='profile_full_update'),

    # Document Vault
    path('documents/', DocumentListCreateView.as_view(), name='document_list_create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document_detail'),
    path('documents/<int:pk>/download/', DocumentDownloadView.as_view(), name='document_download'),
]
