import uuid
from django.db import models
from django.contrib.auth.models import User


class SchemeEvaluation(models.Model):
    """Stores extracted scheme data + evaluation result for a user-uploaded PDF."""

    STATUS_CHOICES = [
        ('Eligible', 'Eligible'),
        ('Partial', 'Partial'),
        ('Not Eligible', 'Not Eligible'),
    ]

    LANGUAGE_CHOICES = [
        ('English', 'English'),
        ('Hindi', 'Hindi'),
        ('Marathi', 'Marathi'),
    ]

    scheme_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scheme_evaluations')

    # Scheme metadata (extracted by Gemini)
    scheme_name = models.CharField(max_length=500)
    scheme_type = models.CharField(max_length=200, blank=True, default='')
    ministry = models.CharField(max_length=300, blank=True, default='')
    benefit_summary = models.TextField(blank=True, default='')
    max_benefit = models.CharField(max_length=200, blank=True, default='')
    category = models.CharField(max_length=200, blank=True, default='')
    tags = models.JSONField(default=list, blank=True)

    # Structured data from Gemini
    extracted_rules = models.JSONField(default=list, blank=True)
    required_documents = models.JSONField(default=list, blank=True)
    application_steps = models.JSONField(default=list, blank=True)
    deadline = models.CharField(max_length=200, blank=True, default='')
    official_portal = models.CharField(max_length=500, blank=True, default='')

    # Evaluation result (deterministic engine)
    evaluation_result = models.JSONField(default=dict, blank=True)
    match_percentage = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Not Eligible')

    # User preferences
    language_preference = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='English')

    # Chat history (per-scheme, persisted)
    chat_history = models.JSONField(default=list, blank=True)

    # Source PDF
    source_pdf = models.FileField(upload_to='scheme_pdfs/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.scheme_name} — {self.user.username} ({self.status})"
