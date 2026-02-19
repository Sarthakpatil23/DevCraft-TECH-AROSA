from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Document


class UserProfileSerializer(serializers.ModelSerializer):
    profile_completion = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            'state', 'gender', 'dob', 'picture', 'occupation',
            'education_level', 'marks_percentage',
            'category', 'minority_status', 'disability_status',
            'area_type', 'annual_income',
            'family_members',
            'profile_completion',
        )

    def get_profile_completion(self, obj):
        return obj.profile_completion


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['state', 'gender', 'dob']


class FullProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating the complete profile (all sections)."""
    first_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = UserProfile
        fields = [
            'first_name',
            'state', 'gender', 'dob', 'occupation',
            'education_level', 'marks_percentage',
            'category', 'minority_status', 'disability_status',
            'area_type', 'annual_income',
            'family_members',
        ]

    def update(self, instance, validated_data):
        # Handle User.first_name separately
        first_name = validated_data.pop('first_name', None)
        if first_name is not None:
            instance.user.first_name = first_name
            instance.user.save()
        return super().update(instance, validated_data)


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'name', 'category', 'file', 'file_size', 'file_type', 'notes', 'uploaded_at', 'updated_at']
        read_only_fields = ['id', 'file_size', 'file_type', 'uploaded_at', 'updated_at']
