"""
Docu-Agent: An agentic AI system for processing government scheme PDFs
and determining eligibility for users.
"""

from .pdf_extractor import PDFExtractor
from .eligibility_checker import EligibilityChecker
from .action_plan_generator import ActionPlanGenerator
from .models import UserProfile, SchemeDocument, EligibilityResult

__version__ = "1.0.0"
__all__ = [
    "PDFExtractor",
    "EligibilityChecker", 
    "ActionPlanGenerator",
    "UserProfile",
    "SchemeDocument",
    "EligibilityResult"
]
