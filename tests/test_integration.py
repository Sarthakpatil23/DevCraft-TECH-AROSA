"""
Integration tests for Docu-Agent system
"""

import pytest
import os
from docu_agent import PDFExtractor, EligibilityChecker, UserProfile
from docu_agent.models import Gender, Category, EducationLevel


@pytest.fixture
def sample_user_profile():
    """Create a sample user profile for testing"""
    return UserProfile(
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


@pytest.fixture
def pdf_extractor():
    """Create PDF extractor instance"""
    return PDFExtractor()


def test_end_to_end_without_api(pdf_extractor, sample_user_profile):
    """Test end-to-end flow without API calls"""
    sample_pdf = "examples/sample_scheme.pdf"
    
    if not os.path.exists(sample_pdf):
        pytest.skip("Sample PDF not found")
    
    # Extract PDF
    scheme_doc = pdf_extractor.create_scheme_document(sample_pdf)
    
    # Verify document was created
    assert scheme_doc is not None
    assert scheme_doc.title is not None
    assert scheme_doc.content is not None
    assert len(scheme_doc.content) > 0
    
    # Verify user profile
    assert sample_user_profile.age == 20
    assert sample_user_profile.category == Category.OBC


def test_pdf_extraction_with_multiple_files(pdf_extractor):
    """Test extracting multiple PDFs"""
    sample_pdf = "examples/sample_scheme.pdf"
    
    if not os.path.exists(sample_pdf):
        pytest.skip("Sample PDF not found")
    
    # Extract same PDF multiple times
    doc1 = pdf_extractor.create_scheme_document(sample_pdf, title="Doc 1")
    doc2 = pdf_extractor.create_scheme_document(sample_pdf, title="Doc 2")
    
    assert doc1.content == doc2.content
    assert doc1.title != doc2.title


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
