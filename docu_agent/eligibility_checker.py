"""
Eligibility Checker module using AI to analyze scheme documents and user profiles.
"""

import os
import json
from typing import Optional
from openai import OpenAI
from .models import (
    SchemeDocument, 
    UserProfile, 
    EligibilityResult, 
    EligibilityStatus,
    EligibilityCriteria
)


class EligibilityChecker:
    """Checks user eligibility for government schemes using AI"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4-turbo-preview"):
        """
        Initialize eligibility checker with OpenAI API.
        
        Args:
            api_key: OpenAI API key. If None, reads from OPENAI_API_KEY env var
            model: OpenAI model to use for analysis
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass api_key parameter.")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = model
    
    def extract_eligibility_criteria(self, scheme_doc: SchemeDocument) -> EligibilityCriteria:
        """
        Extract structured eligibility criteria from scheme document using AI.
        
        Args:
            scheme_doc: SchemeDocument to analyze
            
        Returns:
            EligibilityCriteria object with extracted rules
        """
        prompt = f"""
You are an AI assistant specialized in analyzing government scheme documents.
Extract the eligibility criteria from the following scheme document.

Scheme Title: {scheme_doc.title}

Document Content:
{scheme_doc.content[:4000]}  # Limit to first 4000 chars to avoid token limits

Extract and structure the following information:
1. Age range (if specified) - provide as [min_age, max_age]
2. Income limit (maximum annual family income in rupees)
3. Eligible categories (General, OBC, SC, ST, EWS)
4. Education requirements
5. Gender-specific requirements
6. State-specific requirements
7. Disability requirements
8. Minority-specific requirements
9. Any other important criteria

Provide the response in JSON format with these keys:
{{
    "age_range": [min, max] or null,
    "income_limit": number or null,
    "categories": [list] or null,
    "education_requirements": [list] or null,
    "gender_specific": "string" or null,
    "state_specific": [list] or null,
    "disability_required": true/false/null,
    "minority_specific": true/false/null,
    "other_criteria": {{"key": "value"}}
}}
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing government scheme documents and extracting eligibility criteria."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            criteria_data = json.loads(response.choices[0].message.content)
            
            # Convert age_range from list to tuple if present
            if criteria_data.get("age_range"):
                criteria_data["age_range"] = tuple(criteria_data["age_range"])
            
            return EligibilityCriteria(**criteria_data)
        
        except Exception as e:
            # Return empty criteria if extraction fails
            return EligibilityCriteria()
    
    def check_eligibility(
        self, 
        user_profile: UserProfile, 
        scheme_doc: SchemeDocument
    ) -> EligibilityResult:
        """
        Check if user is eligible for a scheme.
        
        Args:
            user_profile: User's profile information
            scheme_doc: Scheme document to check against
            
        Returns:
            EligibilityResult with decision and explanation
        """
        # Extract criteria if not already done
        if scheme_doc.eligibility_criteria is None:
            scheme_doc.eligibility_criteria = self.extract_eligibility_criteria(scheme_doc)
        
        # Create detailed prompt for AI analysis
        prompt = f"""
You are an AI assistant helping citizens understand their eligibility for government schemes.

USER PROFILE:
- Name: {user_profile.name}
- Age: {user_profile.age}
- Gender: {user_profile.gender}
- Category: {user_profile.category}
- Annual Income: ₹{user_profile.annual_income:,.2f}
- Education: {user_profile.education_level}
- State: {user_profile.state}
- District: {user_profile.district or 'Not specified'}
- Has Disability: {user_profile.is_disabled}
- Belongs to Minority: {user_profile.is_minority}

SCHEME DOCUMENT:
Title: {scheme_doc.title}

Extracted Eligibility Criteria:
{scheme_doc.eligibility_criteria.model_dump_json(indent=2)}

Full Document Content (first 3000 chars):
{scheme_doc.content[:3000]}

TASK:
Analyze the user's profile against the scheme's eligibility criteria and provide:
1. Eligibility Status: "Eligible", "Not Eligible", or "Partially Eligible"
2. List of criteria the user meets (matched_criteria)
3. List of criteria the user doesn't meet (unmatched_criteria)
4. Confidence score (0-1)
5. Detailed explanation of the decision
6. Step-by-step action plan if eligible or partially eligible

Respond in JSON format:
{{
    "status": "Eligible" | "Not Eligible" | "Partially Eligible",
    "matched_criteria": ["criterion 1", "criterion 2", ...],
    "unmatched_criteria": ["criterion 1", "criterion 2", ...],
    "confidence_score": 0.95,
    "explanation": "Detailed explanation...",
    "action_plan": ["Step 1", "Step 2", ...]
}}
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert at evaluating eligibility for government schemes and helping citizens understand complex requirements."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            result_data = json.loads(response.choices[0].message.content)
            
            return EligibilityResult(
                scheme_title=scheme_doc.title,
                **result_data
            )
        
        except Exception as e:
            # Return a default "Unable to determine" result if AI call fails
            return EligibilityResult(
                status=EligibilityStatus.NOT_ELIGIBLE,
                scheme_title=scheme_doc.title,
                matched_criteria=[],
                unmatched_criteria=["Error analyzing eligibility"],
                confidence_score=0.0,
                explanation=f"Error during eligibility check: {str(e)}",
                action_plan=[]
            )
