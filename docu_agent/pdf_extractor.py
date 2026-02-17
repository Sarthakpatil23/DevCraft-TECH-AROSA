"""
PDF Extractor module for reading and extracting text from government scheme PDFs.
"""

import fitz  # PyMuPDF
import os
from typing import Optional
from .models import SchemeDocument


class PDFExtractor:
    """Extracts text content from PDF documents"""
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text content from a PDF file.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Extracted text content
            
        Raises:
            FileNotFoundError: If PDF file doesn't exist
            Exception: If PDF cannot be read
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        try:
            doc = fitz.open(pdf_path)
            text_content = ""
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                text_content += page.get_text()
            
            doc.close()
            return text_content.strip()
        
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def create_scheme_document(self, pdf_path: str, title: Optional[str] = None) -> SchemeDocument:
        """
        Create a SchemeDocument from a PDF file.
        
        Args:
            pdf_path: Path to the PDF file
            title: Optional title for the scheme. If not provided, filename is used.
            
        Returns:
            SchemeDocument object with extracted content
        """
        content = self.extract_text_from_pdf(pdf_path)
        
        if title is None:
            title = os.path.basename(pdf_path).replace('.pdf', '').replace('_', ' ').title()
        
        return SchemeDocument(
            title=title,
            content=content
        )
