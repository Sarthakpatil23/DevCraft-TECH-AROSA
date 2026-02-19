from rest_framework import serializers
from .models import SchemeEvaluation


class SchemeEvaluationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the My Evaluations list."""
    eligibility = serializers.SerializerMethodField()
    dateChecked = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField()
    schemeId = serializers.UUIDField(source='scheme_id')
    schemeName = serializers.CharField(source='scheme_name')
    matchPercent = serializers.IntegerField(source='match_percentage')
    benefitSummary = serializers.CharField(source='benefit_summary')
    chatCount = serializers.SerializerMethodField()

    class Meta:
        model = SchemeEvaluation
        fields = [
            'schemeId', 'schemeName', 'source',
            'matchPercent', 'eligibility', 'dateChecked', 'category',
            'benefitSummary', 'chatCount',
        ]

    def get_eligibility(self, obj):
        status_map = {
            'Eligible': 'eligible',
            'Partial': 'partial',
            'Not Eligible': 'not-eligible',
        }
        return status_map.get(obj.status, 'not-eligible')

    def get_dateChecked(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')

    def get_source(self, obj):
        return 'uploaded'

    def get_chatCount(self, obj):
        history = obj.chat_history or []
        # Count only user messages
        return len([m for m in history if isinstance(m, dict) and m.get('sender') == 'user'])


class SchemeDetailSerializer(serializers.ModelSerializer):
    """Full serializer matching the frontend SchemeDetail interface."""

    class Meta:
        model = SchemeEvaluation
        fields = '__all__'

    def to_representation(self, instance):
        """Transform to match exact frontend SchemeDetail shape."""
        eval_result = instance.evaluation_result or {}
        conditions = eval_result.get('conditions', [])

        # Map status to frontend enum
        status_map = {
            'Eligible': 'eligible',
            'Partial': 'partial',
            'Not Eligible': 'not-eligible',
        }

        # Build documents list with availability check
        docs = instance.required_documents or []
        user = instance.user
        user_doc_names = set()
        if user:
            from accounts.models import Document
            user_docs = Document.objects.filter(user=user).values_list('name', flat=True)
            user_doc_names = {d.lower() for d in user_docs}

        documents = []
        for doc in docs:
            doc_name = doc.get('name', '') if isinstance(doc, dict) else str(doc)
            digilocker_flag = doc.get('digilocker', False) if isinstance(doc, dict) else False
            # Check if user has a document with similar name
            available = any(
                doc_name.lower() in ud or ud in doc_name.lower()
                for ud in user_doc_names
            ) if user_doc_names else False

            documents.append({
                'name': doc_name,
                'available': available,
                'digilocker': digilocker_flag,
            })

        # Build steps
        steps = instance.application_steps or []
        application_steps = []
        for s in steps:
            if isinstance(s, dict):
                application_steps.append({
                    'step': s.get('step', 0),
                    'title': s.get('title', ''),
                    'description': s.get('description', ''),
                    'done': False,
                })
            else:
                application_steps.append({
                    'step': 0,
                    'title': str(s),
                    'description': '',
                    'done': False,
                })

        return {
            'id': str(instance.scheme_id),
            'name': instance.scheme_name,
            'ministry': instance.ministry,
            'matchPercent': instance.match_percentage,
            'eligibility': status_map.get(instance.status, 'not-eligible'),
            'category': instance.category or 'Other',
            'tags': instance.tags or [],
            'deadline': instance.deadline or 'Ongoing',
            'benefitSummary': instance.benefit_summary,
            'maxBenefit': instance.max_benefit or 'Varies',
            'portalUrl': instance.official_portal or '',
            'conditions': conditions,
            'documents': documents,
            'steps': application_steps,
            'chatHistory': instance.chat_history or [],
        }
