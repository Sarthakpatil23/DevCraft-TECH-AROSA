"""
Tests for PDF Extractor
"""

import pytest
import os
from docu_agent.pdf_extractor import PDFExtractor
from docu_agent.models import SchemeDocument


@pytest.fixture
def pdf_extractor():
    """Create a PDF extractor instance"""
    return PDFExtractor()


@pytest.fixture
def sample_pdf_path():
    """Get path to sample PDF"""
    return "examples/sample_scheme.pdf"


def test_pdf_extractor_initialization(pdf_extractor):
    """Test PDF extractor can be initialized"""
    assert pdf_extractor is not None


def test_extract_text_from_existing_pdf(pdf_extractor, sample_pdf_path):
    """Test extracting text from an existing PDF"""
    if not os.path.exists(sample_pdf_path):
        pytest.skip("Sample PDF not found")
    
    text = pdf_extractor.extract_text_from_pdf(sample_pdf_path)
    
    assert text is not None
    assert len(text) > 0
    assert isinstance(text, str)


def test_extract_text_from_nonexistent_pdf(pdf_extractor):
    """Test that extracting from non-existent PDF raises error"""
    with pytest.raises(FileNotFoundError):
        pdf_extractor.extract_text_from_pdf("nonexistent.pdf")


def test_create_scheme_document(pdf_extractor, sample_pdf_path):
    """Test creating a scheme document from PDF"""
    if not os.path.exists(sample_pdf_path):
        pytest.skip("Sample PDF not found")
    
    doc = pdf_extractor.create_scheme_document(sample_pdf_path)
    
    assert isinstance(doc, SchemeDocument)
    assert doc.title is not None
    assert doc.content is not None
    assert len(doc.content) > 0


def test_create_scheme_document_with_custom_title(pdf_extractor, sample_pdf_path):
    """Test creating scheme document with custom title"""
    if not os.path.exists(sample_pdf_path):
        pytest.skip("Sample PDF not found")
    
    custom_title = "Custom Scholarship Scheme"
    doc = pdf_extractor.create_scheme_document(sample_pdf_path, title=custom_title)
    
    assert doc.title == custom_title


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
