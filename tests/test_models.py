"""
Tests for Docu-Agent models
"""

import pytest
from docu_agent.models import (
    UserProfile, 
    Gender, 
    Category, 
    EducationLevel,
    SchemeDocument,
    EligibilityCriteria,
    EligibilityResult,
    EligibilityStatus
)


def test_user_profile_creation():
    """Test creating a valid user profile"""
    profile = UserProfile(
        name="Test User",
        age=20,
        gender=Gender.MALE,
        category=Category.OBC,
        annual_income=250000,
        education_level=EducationLevel.UNDERGRADUATE,
        state="Maharashtra",
        district="Mumbai",
        is_disabled=False,
        is_minority=False
    )
    
    assert profile.name == "Test User"
    assert profile.age == 20
    assert profile.annual_income == 250000


def test_user_profile_validation():
    """Test user profile validation"""
    with pytest.raises(Exception):
        # Invalid age (negative)
        UserProfile(
            name="Test User",
            age=-5,
            gender=Gender.MALE,
            category=Category.OBC,
            annual_income=250000,
            education_level=EducationLevel.UNDERGRADUATE,
            state="Maharashtra"
        )


def test_scheme_document_creation():
    """Test creating a scheme document"""
    doc = SchemeDocument(
        title="Test Scholarship",
        content="This is test content for a scholarship scheme."
    )
    
    assert doc.title == "Test Scholarship"
    assert "scholarship" in doc.content.lower()


def test_eligibility_criteria_creation():
    """Test creating eligibility criteria"""
    criteria = EligibilityCriteria(
        age_range=(18, 30),
        income_limit=300000,
        categories=["OBC", "SC"],
        education_requirements=["Undergraduate"],
        state_specific=["Maharashtra"]
    )
    
    assert criteria.age_range == (18, 30)
    assert criteria.income_limit == 300000
    assert "OBC" in criteria.categories


def test_eligibility_result_creation():
    """Test creating eligibility result"""
    result = EligibilityResult(
        status=EligibilityStatus.ELIGIBLE,
        scheme_title="Test Scheme",
        matched_criteria=["Age requirement", "Income requirement"],
        unmatched_criteria=[],
        confidence_score=0.95,
        explanation="User meets all criteria",
        action_plan=["Step 1", "Step 2"]
    )
    
    assert result.status == EligibilityStatus.ELIGIBLE
    assert result.confidence_score == 0.95
    assert len(result.action_plan) == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
