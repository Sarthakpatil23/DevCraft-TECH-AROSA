"""
Gemini API service for:
1. Extracting structured eligibility rules from scheme PDF text.
2. Generating chat responses about a scheme.

Gemini is ONLY used for structured extraction and chat — NOT for eligibility decisions.
"""

import json
import os
import logging
import time
import pdfplumber
from google import genai
from google.genai import errors as genai_errors

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')


def _get_client():
    """Return a Gemini client using the API key."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in environment variables.")
    return genai.Client(api_key=GEMINI_API_KEY)


# ---------------------------------------------------------------------------
# PDF Text Extraction
# ---------------------------------------------------------------------------

def extract_text_from_pdf(file_obj) -> str:
    """Extract all text from a PDF file object using pdfplumber."""
    text_parts = []
    with pdfplumber.open(file_obj) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


# ---------------------------------------------------------------------------
# Gemini: Structured Rule Extraction
# ---------------------------------------------------------------------------

EXTRACTION_PROMPT = """You are an expert Indian government scheme analyst.

Given the following text extracted from a government scheme PDF document, extract the information in a **strict JSON** format. Respond ONLY with the JSON object — no markdown fences, no explanation.

The JSON must have these exact keys:

{{
    "scheme_name": "Full official name of the scheme",
    "ministry": "Ministry or department name",
    "category": "One of: Agriculture, Education, Healthcare, Employment, Housing, Finance, Social Welfare, Other",
    "tags": ["tag1", "tag2"],
    "benefit_summary": "2-3 sentence summary of benefits in {language}",
    "max_benefit": "Maximum monetary benefit (e.g. '₹6,000/year') or 'Varies'",
    "deadline": "Application deadline if mentioned, else 'Ongoing'",
    "official_portal": "URL of official portal if mentioned, else ''",
    "eligibility_rules": [
        {{
            "field": "<user_profile_field>",
            "label": "Human-readable label in {language}",
            "operator": "<one of: ==, !=, <, >, <=, >=, in, not_in, exists, between>",
            "value": "<expected value or [list] or [min, max] for between>",
            "detail": "Brief explanation in {language}"
        }}
    ],
    "required_documents": [
        {{
            "name": "Document name in {language}",
            "digilocker": true or false
        }}
    ],
    "application_steps": [
        {{
            "step": 1,
            "title": "Step title in {language}",
            "description": "Step description in {language}"
        }}
    ]
}}

RULES FOR eligibility_rules:
- "field" must be one of: state, gender, dob, occupation, education_level, marks_percentage, category, minority_status, disability_status, area_type, annual_income, age, family_members_count
- "operator" options: == (equals), != (not equals), < (less than), > (greater than), <= (lte), >= (gte), in (value is a list, user's value must be in it), not_in (user's value must NOT be in it), exists (field must be non-empty), between (value is [min, max])
- For age-based rules, use field "age" (we compute age from dob)
- For income, assume numeric comparison (we parse annual_income to number)
- For marks_percentage, assume numeric comparison
- For boolean fields (minority_status, disability_status), use operator "==" and value true/false

If you cannot determine certain fields from the text, use reasonable defaults. Always return valid JSON.

LANGUAGE: All human-readable text (label, detail, benefit_summary, document names, step titles/descriptions) must be in {language}.

--- PDF TEXT ---
{pdf_text}
"""


class GeminiRateLimitError(Exception):
    """Raised when Gemini API returns a 429 rate limit error."""
    pass


def _call_gemini_with_retry(client, model: str, contents: str, max_retries: int = 2):
    """
    Call Gemini API with automatic retry on 429 rate limit errors.
    Waits the suggested retry delay before retrying.
    """
    for attempt in range(max_retries + 1):
        try:
            response = client.models.generate_content(
                model=model,
                contents=contents,
            )
            return response
        except genai_errors.ClientError as e:
            if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
                logger.error(f"Gemini API 429/Resource Exhausted Error details: {e}")
                if attempt < max_retries:
                    # Extract retry delay from error or use default
                    wait_time = 15 * (attempt + 1)  # 15s, 30s
                    logger.warning(f"Rate limited (attempt {attempt + 1}), waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                raise GeminiRateLimitError(
                    "Gemini API rate limit exceeded. Your free tier quota may be exhausted. "
                    "Please wait a minute and try again, or upgrade your API key at https://aistudio.google.com."
                )
            raise


def extract_rules_from_pdf(pdf_text: str, language: str = "English") -> dict:
    """
    Send PDF text to Gemini and get structured scheme data back.
    Retries on JSON parse failure and rate limits.
    """
    client = _get_client()
    prompt = EXTRACTION_PROMPT.replace("{language}", language).replace("{pdf_text}", pdf_text[:15000])  # Limit text length

    for attempt in range(2):
        try:
            response = _call_gemini_with_retry(client, "gemini-2.5-flash", prompt)
            raw = response.text.strip()
            # Strip markdown fences if present
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
                if raw.endswith("```"):
                    raw = raw[:-3]
                raw = raw.strip()

            data = json.loads(raw)

            # Validate required keys exist
            required_keys = [
                "scheme_name", "eligibility_rules",
                "required_documents", "application_steps"
            ]
            for key in required_keys:
                if key not in data:
                    raise ValueError(f"Missing required key: {key}")

            return data

        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Gemini extraction attempt {attempt + 1} failed: {e}")
            if attempt == 0:
                prompt += "\n\nIMPORTANT: Your previous response was not valid JSON. Please return ONLY a valid JSON object with no extra text."
                continue
            raise ValueError(f"Failed to extract valid JSON from Gemini after 2 attempts: {e}")
        except GeminiRateLimitError:
            raise
        except Exception as e:
            logger.error(f"Gemini API generic error details: {e}", exc_info=True)
            raise


# ---------------------------------------------------------------------------
# Gemini: Chat
# ---------------------------------------------------------------------------

CHAT_SYSTEM_PROMPT = """You are Eligify AI, a helpful and professional assistant that answers questions about the Indian government scheme described below. You help users understand eligibility, application process, required documents, and benefits.

SCHEME DATA:
{scheme_data}

USER ELIGIBILITY EVALUATION:
{evaluation_data}

FORMATTING RULES (VERY IMPORTANT — follow strictly):
- Use **bold** for key terms, scheme names, amounts, statuses (e.g. **Eligible**, **₹6,000/year**, **Annual Income**)
- Use bullet points (- ) for listing items, criteria, or steps
- Use numbered lists (1. 2. 3.) for sequential steps or procedures
- Use ### headings to separate major sections when the answer covers multiple topics
- Use `inline code` for field names or specific values (e.g. `annual_income`, `SC/ST`)
- Use > blockquotes for important notes or warnings
- Use --- horizontal rules to separate distinct sections in longer answers
- Add line breaks between sections for readability
- Use tables (| col1 | col2 |) when comparing criteria or showing status of multiple rules
- Use emojis sparingly for status: ✅ for met criteria, ❌ for unmet, ⚠️ for warnings, 📋 for documents, 🔗 for links

CONTENT RULES:
- Answer in {language}
- Be concise but well-structured — prioritize clarity and scannability
- If the user asks about something not in the scheme data, say you don't have that information
- Never make up eligibility criteria that aren't in the data
- You can explain the conditions, suggest next steps, or clarify requirements
- Keep responses under 300 words unless the user asks for detailed explanation
- Always structure your response so it's easy to scan quickly
"""


def generate_chat_response(
    extracted_rules: dict,
    evaluation_result: dict,
    chat_history: list,
    user_message: str,
    language: str = "English"
) -> str:
    """Generate a chat response using Gemini with scheme context."""
    client = _get_client()

    scheme_data_str = json.dumps(extracted_rules, indent=2, ensure_ascii=False)
    eval_data_str = json.dumps(evaluation_result, indent=2, ensure_ascii=False)

    system_prompt = CHAT_SYSTEM_PROMPT.replace(
        "{scheme_data}", scheme_data_str
    ).replace(
        "{evaluation_data}", eval_data_str
    ).replace(
        "{language}", language
    )

    # Build conversation contents
    contents = [system_prompt + "\n\n"]

    # Add chat history (last 10 messages to avoid token limit)
    for msg in chat_history[-10:]:
        role = "user" if msg.get("sender") == "user" else "model"
        if role == "user":
            contents.append(f"User: {msg['text']}")
        else:
            contents.append(f"Assistant: {msg['text']}")

    contents.append(f"User: {user_message}")

    full_prompt = "\n".join(contents)

    try:
        # Use gemini-2.5-flash model as requested
        response = _call_gemini_with_retry(client, "gemini-2.5-flash", full_prompt)
        return response.text.strip()
    except GeminiRateLimitError:
        return "I'm currently rate-limited by the AI service. Please wait a minute and try again."
    except Exception as e:
        logger.error(f"Gemini chat error: {e}")
        return "I'm sorry, I couldn't process your question right now. Please try again."
