import json
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import SchemeEvaluation
from .serializers import SchemeEvaluationListSerializer, SchemeDetailSerializer
from .services import extract_text_from_pdf, extract_rules_from_pdf, generate_chat_response, GeminiRateLimitError
from .engine import evaluate_eligibility

logger = logging.getLogger(__name__)


def _build_profile_data(user):
    """Flatten UserProfile into a dict the eligibility engine can consume."""
    try:
        profile = user.profile
    except Exception:
        return {}

    data = {
        'state': profile.state or '',
        'gender': profile.gender or '',
        'dob': str(profile.dob) if profile.dob else '',
        'occupation': profile.occupation or '',
        'education_level': profile.education_level or '',
        'marks_percentage': profile.marks_percentage or '',
        'category': profile.category or '',
        'minority_status': profile.minority_status,
        'disability_status': profile.disability_status,
        'area_type': profile.area_type or '',
        'annual_income': profile.annual_income or '',
        'family_members': profile.family_members or [],
    }
    return data


# ---------------------------------------------------------------------------
# POST /api/scheme/upload/
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_scheme(request):
    """
    Upload a scheme PDF → extract text → Gemini extraction → deterministic evaluation → save.
    Returns the scheme_id for redirect.
    """
    pdf_file = request.FILES.get('file')
    if not pdf_file:
        return Response({'error': 'No PDF file provided.'}, status=status.HTTP_400_BAD_REQUEST)

    if not pdf_file.name.lower().endswith('.pdf'):
        return Response({'error': 'Only PDF files are accepted.'}, status=status.HTTP_400_BAD_REQUEST)

    scheme_name = request.data.get('scheme_name', pdf_file.name.replace('.pdf', '').replace('_', ' ').title())
    language = request.data.get('language', 'English')

    try:
        # Step 1: Extract text from PDF
        pdf_text = extract_text_from_pdf(pdf_file)
        if not pdf_text.strip():
            return Response({'error': 'Could not extract text from PDF. The file may be image-based or corrupted.'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 2: Gemini structured extraction
        extracted_data = extract_rules_from_pdf(pdf_text, language)

        # Step 3: Deterministic eligibility evaluation
        profile_data = _build_profile_data(request.user)
        eligibility_rules = extracted_data.get('eligibility_rules', [])
        eval_result = evaluate_eligibility(profile_data, eligibility_rules)

        # Use scheme_name from Gemini if it extracted one, otherwise use user-provided
        final_name = scheme_name or extracted_data.get('scheme_name', 'Unnamed Scheme')

        # Step 4: Save to database
        scheme = SchemeEvaluation.objects.create(
            user=request.user,
            scheme_name=final_name,
            ministry=extracted_data.get('ministry', ''),
            benefit_summary=extracted_data.get('benefit_summary', ''),
            max_benefit=extracted_data.get('max_benefit', ''),
            category=extracted_data.get('category', 'Other'),
            tags=extracted_data.get('tags', []),
            extracted_rules=eligibility_rules,
            required_documents=extracted_data.get('required_documents', []),
            application_steps=extracted_data.get('application_steps', []),
            deadline=extracted_data.get('deadline', 'Ongoing'),
            official_portal=extracted_data.get('official_portal', ''),
            evaluation_result=eval_result,
            match_percentage=eval_result.get('match_percentage', 0),
            status=eval_result.get('status', 'Not Eligible'),
            language_preference=language,
            source_pdf=pdf_file,
        )

        return Response({
            'scheme_id': str(scheme.scheme_id),
            'scheme_name': scheme.scheme_name,
            'match_percentage': scheme.match_percentage,
            'status': scheme.status,
        }, status=status.HTTP_201_CREATED)

    except GeminiRateLimitError as e:
        logger.warning(f"Rate limit hit during upload: {e}")
        return Response({'error': str(e)}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    except ValueError as e:
        logger.error(f"Upload processing error: {e}")
        return Response({'error': str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    except Exception as e:
        logger.error(f"Upload error: {e}", exc_info=True)
        return Response({'error': 'An unexpected error occurred during processing.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# GET /api/scheme/<scheme_id>/
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def scheme_detail(request, scheme_id):
    """Return full scheme detail matching the frontend SchemeDetail interface."""
    scheme = get_object_or_404(SchemeEvaluation, scheme_id=scheme_id, user=request.user)
    serializer = SchemeDetailSerializer(scheme)
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# POST /api/scheme/<scheme_id>/chat/
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scheme_chat(request, scheme_id):
    """Send a message to the AI chat for a specific scheme."""
    scheme = get_object_or_404(SchemeEvaluation, scheme_id=scheme_id, user=request.user)

    user_message = request.data.get('message', '').strip()
    if not user_message:
        return Response({'error': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Build context for Gemini
    extracted_context = {
        'scheme_name': scheme.scheme_name,
        'ministry': scheme.ministry,
        'benefit_summary': scheme.benefit_summary,
        'max_benefit': scheme.max_benefit,
        'category': scheme.category,
        'eligibility_rules': scheme.extracted_rules,
        'required_documents': scheme.required_documents,
        'application_steps': scheme.application_steps,
        'deadline': scheme.deadline,
        'official_portal': scheme.official_portal,
    }

    ai_response = generate_chat_response(
        extracted_rules=extracted_context,
        evaluation_result=scheme.evaluation_result,
        chat_history=scheme.chat_history or [],
        user_message=user_message,
        language=scheme.language_preference,
    )

    # Persist chat history
    history = scheme.chat_history or []
    history.append({'sender': 'user', 'text': user_message})
    history.append({'sender': 'ai', 'text': ai_response})
    scheme.chat_history = history
    scheme.save(update_fields=['chat_history'])

    return Response({
        'response': ai_response,
        'chat_history': history,
    })


# ---------------------------------------------------------------------------
# GET /api/my-evaluations/
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_evaluations(request):
    """Return all evaluations for the current user."""
    evaluations = SchemeEvaluation.objects.filter(user=request.user)
    serializer = SchemeEvaluationListSerializer(evaluations, many=True)
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# POST /api/scheme/<scheme_id>/re-evaluate/
# ---------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def re_evaluate(request, scheme_id):
    """Re-run eligibility evaluation with updated profile data."""
    scheme = get_object_or_404(SchemeEvaluation, scheme_id=scheme_id, user=request.user)

    profile_data = _build_profile_data(request.user)
    eval_result = evaluate_eligibility(profile_data, scheme.extracted_rules)

    scheme.evaluation_result = eval_result
    scheme.match_percentage = eval_result.get('match_percentage', 0)
    scheme.status = eval_result.get('status', 'Not Eligible')
    scheme.save(update_fields=['evaluation_result', 'match_percentage', 'status'])

    serializer = SchemeDetailSerializer(scheme)
    return Response(serializer.data)
