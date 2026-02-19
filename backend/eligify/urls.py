from django.urls import path
from . import views

urlpatterns = [
    path('scheme/upload/', views.upload_scheme, name='scheme-upload'),
    path('scheme/<uuid:scheme_id>/', views.scheme_detail, name='scheme-detail'),
    path('scheme/<uuid:scheme_id>/chat/', views.scheme_chat, name='scheme-chat'),
    path('scheme/<uuid:scheme_id>/re-evaluate/', views.re_evaluate, name='scheme-re-evaluate'),
    path('my-evaluations/', views.my_evaluations, name='my-evaluations'),
]
