"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.views.static import serve
from django.http import HttpResponse
import os


def dynamic_scheme_view(request, scheme_id):
    """
    Serve the scheme detail page for dynamically-created schemes (UUIDs).
    Reads a pre-built Next.js HTML page and replaces the baked-in schemeId
    with the actual UUID so client-side hydration picks up the correct param.
    """
    template_path = os.path.join(settings.NEXTJS_BUILD_DIR, 'dashboard', 'explore', 'pm-kisan.html')
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            html = f.read()
        # Replace the baked-in slug with the real UUID in Next.js route data
        html = html.replace('pm-kisan', scheme_id)
        return HttpResponse(html)
    except FileNotFoundError:
        return HttpResponse('Page not found', status=404)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('eligify.urls')),
    path('accounts/', include('allauth.urls')),  # Allauth URLs for social auth
    
    # Serve Next.js static files
    re_path(r'^_next/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.NEXTJS_BUILD_DIR, '_next'),
    }),
    
    # Serve static files
    re_path(r'^static/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.NEXTJS_BUILD_DIR, 'static'),
    }),

    # Serve root-level assets (logo.png, favicon.ico, etc.) from Next.js out/
    re_path(r'^(?P<path>logo\.png|favicon\.ico|.*\.svg|.*\.webp)$', serve, {
        'document_root': settings.NEXTJS_BUILD_DIR,
    }),
    
    # Next.js pages
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('onboarding/', TemplateView.as_view(template_name='onboarding.html'), name='onboarding'),
    path('dashboard/', TemplateView.as_view(template_name='dashboard.html'), name='dashboard'),
    path('dashboard/profile', TemplateView.as_view(template_name='dashboard/profile.html'), name='dashboard-profile'),
    path('dashboard/explore', TemplateView.as_view(template_name='dashboard/explore.html'), name='dashboard-explore'),
    path('dashboard/upload', TemplateView.as_view(template_name='dashboard/upload.html'), name='dashboard-upload'),
    path('dashboard/evaluations', TemplateView.as_view(template_name='dashboard/evaluations.html'), name='dashboard-evaluations'),
    path('dashboard/docs', TemplateView.as_view(template_name='dashboard/docs.html'), name='dashboard-docs'),
    path('dashboard/vault', TemplateView.as_view(template_name='dashboard/vault.html'), name='dashboard-vault'),
    path('dashboard/resources', TemplateView.as_view(template_name='dashboard/resources.html'), name='dashboard-resources'),
    path('dashboard/notifications', TemplateView.as_view(template_name='dashboard/notifications.html'), name='dashboard-notifications'),
    path('dashboard/explore/pm-kisan', TemplateView.as_view(template_name='dashboard/explore/pm-kisan.html'), name='scheme-pm-kisan'),
    path('dashboard/explore/national-scholarship', TemplateView.as_view(template_name='dashboard/explore/national-scholarship.html'), name='scheme-national-scholarship'),
    path('dashboard/explore/ayushman-bharat', TemplateView.as_view(template_name='dashboard/explore/ayushman-bharat.html'), name='scheme-ayushman-bharat'),
    path('dashboard/explore/startup-india', TemplateView.as_view(template_name='dashboard/explore/startup-india.html'), name='scheme-startup-india'),
    path('dashboard/explore/pm-awas', TemplateView.as_view(template_name='dashboard/explore/pm-awas.html'), name='scheme-pm-awas'),
    path('dashboard/explore/maha-dbt', TemplateView.as_view(template_name='dashboard/explore/maha-dbt.html'), name='scheme-maha-dbt'),
    path('dashboard/explore/mudra-loan', TemplateView.as_view(template_name='dashboard/explore/mudra-loan.html'), name='scheme-mudra-loan'),
    path('dashboard/explore/sukanya-samriddhi', TemplateView.as_view(template_name='dashboard/explore/sukanya-samriddhi.html'), name='scheme-sukanya-samriddhi'),
    path('dashboard/explore/pm-kaushal', TemplateView.as_view(template_name='dashboard/explore/pm-kaushal.html'), name='scheme-pm-kaushal'),
    path('dashboard/explore/farmer-credit', TemplateView.as_view(template_name='dashboard/explore/farmer-credit.html'), name='scheme-farmer-credit'),
    path('dashboard/explore/obc-scholarship', TemplateView.as_view(template_name='dashboard/explore/obc-scholarship.html'), name='scheme-obc-scholarship'),
    path('dashboard/explore/state-farmer', TemplateView.as_view(template_name='dashboard/explore/state-farmer.html'), name='scheme-state-farmer'),
    # Catch-all for dynamic scheme UUIDs (uploaded schemes)
    # Serve an existing scheme page as shell — the JS reads schemeId from URL and fetches from API
    re_path(r'^dashboard/explore/(?P<scheme_id>[0-9a-f\-]+)$', dynamic_scheme_view, name='scheme-dynamic'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
