from django.contrib import admin
from .models import SchemeEvaluation


@admin.register(SchemeEvaluation)
class SchemeEvaluationAdmin(admin.ModelAdmin):
    list_display = ['scheme_name', 'user', 'match_percentage', 'status', 'language_preference', 'created_at']
    list_filter = ['status', 'language_preference', 'category']
    search_fields = ['scheme_name', 'user__username']
    readonly_fields = ['scheme_id', 'created_at']
