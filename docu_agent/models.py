"""
Data models for Docu-Agent system.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from enum import Enum


class Category(str, Enum):
    """User category types"""
    GENERAL = "General"
    OBC = "OBC"
    SC = "SC"
    ST = "ST"
    EWS = "EWS"


class Gender(str, Enum):
    """Gender types"""
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"


class EducationLevel(str, Enum):
    """Education levels"""
    HIGH_SCHOOL = "High School"
    UNDERGRADUATE = "Undergraduate"
    POSTGRADUATE = "Postgraduate"
    DOCTORATE = "Doctorate"


class UserProfile(BaseModel):
    """User profile with all relevant information for eligibility checking"""
    name: str = Field(..., description="User's full name")
    age: int = Field(..., ge=0, le=150, description="User's age")
    gender: Gender = Field(..., description="User's gender")
    category: Category = Field(..., description="User's social category")
    annual_income: float = Field(..., ge=0, description="Annual family income in rupees")
    education_level: EducationLevel = Field(..., description="Current education level")
    state: str = Field(..., description="State of residence")
    district: Optional[str] = Field(None, description="District of residence")
    is_disabled: bool = Field(False, description="Whether user has a disability")
    is_minority: bool = Field(False, description="Whether user belongs to a minority community")
    
    model_config = {"use_enum_values": True}


class EligibilityCriteria(BaseModel):
    """Extracted eligibility criteria from a scheme"""
    age_range: Optional[tuple[int, int]] = Field(None, description="Minimum and maximum age")
    income_limit: Optional[float] = Field(None, description="Maximum annual income")
    categories: Optional[List[str]] = Field(None, description="Eligible categories")
    education_requirements: Optional[List[str]] = Field(None, description="Required education levels")
    gender_specific: Optional[str] = Field(None, description="Gender-specific scheme")
    state_specific: Optional[List[str]] = Field(None, description="Applicable states")
    disability_required: Optional[bool] = Field(None, description="Only for disabled persons")
    minority_specific: Optional[bool] = Field(None, description="Only for minorities")
    other_criteria: Dict[str, str] = Field(default_factory=dict, description="Other criteria")


class SchemeDocument(BaseModel):
    """Represents a government scheme document"""
    title: str = Field(..., description="Title of the scheme")
    content: str = Field(..., description="Full text content of the document")
    eligibility_criteria: Optional[EligibilityCriteria] = Field(None, description="Extracted eligibility criteria")
    benefits: Optional[str] = Field(None, description="Benefits provided by the scheme")
    application_process: Optional[str] = Field(None, description="How to apply")
    required_documents: Optional[List[str]] = Field(None, description="Documents needed to apply")
    deadline: Optional[str] = Field(None, description="Application deadline")


class EligibilityStatus(str, Enum):
    """Eligibility status"""
    ELIGIBLE = "Eligible"
    NOT_ELIGIBLE = "Not Eligible"
    PARTIALLY_ELIGIBLE = "Partially Eligible"


class EligibilityResult(BaseModel):
    """Result of eligibility check"""
    status: EligibilityStatus = Field(..., description="Eligibility status")
    scheme_title: str = Field(..., description="Title of the scheme")
    matched_criteria: List[str] = Field(default_factory=list, description="Criteria that user meets")
    unmatched_criteria: List[str] = Field(default_factory=list, description="Criteria that user doesn't meet")
    confidence_score: float = Field(..., ge=0, le=1, description="Confidence in the decision")
    explanation: str = Field(..., description="Detailed explanation of the decision")
    action_plan: List[str] = Field(default_factory=list, description="Step-by-step action plan")
