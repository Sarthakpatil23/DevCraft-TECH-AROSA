import json
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # Basic Info (collected during onboarding)
    state = models.CharField(max_length=100, blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)

    # OAuth
    google_id = models.CharField(max_length=255, blank=True, null=True)
    picture = models.URLField(blank=True, null=True)

    # Education
    education_level = models.CharField(max_length=50, blank=True, null=True)
    marks_percentage = models.CharField(max_length=10, blank=True, null=True)

    # Social & Financial
    category = models.CharField(max_length=20, blank=True, null=True)
    minority_status = models.BooleanField(default=False)
    disability_status = models.BooleanField(default=False)
    area_type = models.CharField(max_length=20, blank=True, null=True)
    annual_income = models.CharField(max_length=50, blank=True, null=True)

    # Family (stored as JSON)
    family_members = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def profile_completion(self):
        """Calculate profile completion percentage with weighted sections."""
        # Basic Info - 30% (fullName, email come from User model)
        basic_fields = [
            self.user.first_name,
            self.user.email,
            self.state,
            self.gender,
            self.dob,
            self.occupation,
        ]
        basic_filled = sum(1 for f in basic_fields if f)
        basic_percent = (basic_filled / len(basic_fields)) * 30

        # Education - 25%
        edu_fields = [self.education_level, self.marks_percentage]
        edu_filled = sum(1 for f in edu_fields if f)
        edu_percent = (edu_filled / len(edu_fields)) * 25

        # Social & Financial - 35%
        social_fields = [self.category, self.annual_income, self.area_type]
        social_filled = sum(1 for f in social_fields if f) + 2  # +2 for booleans (always set)
        social_total = len(social_fields) + 2
        social_percent = (social_filled / social_total) * 35

        # Family - 10%
        members = self.family_members or []
        if members:
            has_complete = any(
                m.get('relation') and m.get('occupation') and m.get('income')
                for m in members
            )
            family_percent = 10 if has_complete else 5
        else:
            family_percent = 0

        total = round(basic_percent + edu_percent + social_percent + family_percent)
        return {
            'total': min(total, 100),
            'basic_percent': round(basic_percent),
            'edu_percent': round(edu_percent),
            'social_percent': round(social_percent),
            'family_percent': family_percent,
            'basic_complete': basic_filled == len(basic_fields),
            'education_complete': edu_filled == len(edu_fields),
            'social_complete': all([self.category, self.annual_income]),
            'family_complete': len(members) > 0,
        }


class Document(models.Model):
    """User-uploaded documents stored in the vault."""
    CATEGORY_CHOICES = [
        ('identity', 'Identity'),
        ('education', 'Education'),
        ('income', 'Income & Financial'),
        ('property', 'Property & Land'),
        ('certificates', 'Certificates'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    file = models.FileField(upload_to='documents/%Y/%m/')
    file_size = models.PositiveIntegerField(default=0)  # in bytes
    file_type = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
