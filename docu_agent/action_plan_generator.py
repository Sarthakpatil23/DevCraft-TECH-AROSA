"""
Action Plan Generator module for creating step-by-step application guides.
"""

import os
from typing import List
from openai import OpenAI
from .models import SchemeDocument, UserProfile, EligibilityResult, EligibilityStatus


class ActionPlanGenerator:
    """Generates detailed action plans for applying to schemes"""
    
    # Maximum content length for AI prompts to avoid token limits
    MAX_CONTENT_LENGTH = 4000
    
    def __init__(self, api_key: str = None, model: str = "gpt-4-turbo-preview"):
        """
        Initialize action plan generator.
        
        Args:
            api_key: OpenAI API key. If None, reads from OPENAI_API_KEY env var
            model: OpenAI model to use
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = model
    
    def generate_action_plan(
        self,
        user_profile: UserProfile,
        scheme_doc: SchemeDocument,
        eligibility_result: EligibilityResult
    ) -> List[str]:
        """
        Generate a detailed step-by-step action plan for applying to a scheme.
        
        Args:
            user_profile: User's profile
            scheme_doc: Scheme document
            eligibility_result: Result of eligibility check
            
        Returns:
            List of actionable steps
        """
        if eligibility_result.status == EligibilityStatus.NOT_ELIGIBLE:
            return [
                "Unfortunately, you are not eligible for this scheme based on current criteria.",
                "Review the unmatched criteria to understand why.",
                "Consider looking for similar schemes that may better match your profile."
            ]
        
        prompt = f"""
You are an expert assistant helping citizens apply for government schemes.

USER: {user_profile.name}
SCHEME: {scheme_doc.title}
ELIGIBILITY: {eligibility_result.status}

Scheme Details:
{scheme_doc.content[:self.MAX_CONTENT_LENGTH]}

Create a detailed, actionable, step-by-step plan for this user to successfully apply for the scheme.
Include:
1. Documents to gather
2. Where and how to apply
3. Important deadlines
4. Tips for a successful application
5. What to do after applying

Make it clear, concise, and easy to follow. Number each step.
Return only the steps as a JSON array of strings.
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert at creating clear, actionable plans for government scheme applications."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            # Parse the response - expecting JSON array
            import json
            steps = json.loads(response.choices[0].message.content)
            
            if isinstance(steps, list):
                return steps
            elif isinstance(steps, dict) and "steps" in steps:
                return steps["steps"]
            else:
                return [str(steps)]
        
        except Exception as e:
            # Return basic steps if AI call fails
            return [
                "Visit the official government portal for this scheme",
                "Gather required documents as listed in the scheme document",
                "Fill out the application form completely and accurately",
                "Submit the application before the deadline",
                "Keep a copy of the application for your records",
                "Follow up on your application status regularly"
            ]
