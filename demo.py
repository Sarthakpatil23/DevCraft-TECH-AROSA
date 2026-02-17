#!/usr/bin/env python3
"""
Demo script to showcase Docu-Agent functionality without API calls.
This demonstrates the PDF extraction and data modeling capabilities.
"""

from docu_agent.pdf_extractor import PDFExtractor
from docu_agent.models import UserProfile, Gender, Category, EducationLevel


def main():
    print("=" * 80)
    print("DOCU-AGENT DEMO - PDF Extraction and Profile Matching")
    print("=" * 80)
    
    # Create a user profile
    print("\n📋 Creating User Profile...")
    user_profile = UserProfile(
        name="Rahul Kumar",
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
    
    print(f"\nUser Profile Created:")
    print(f"  Name: {user_profile.name}")
    print(f"  Age: {user_profile.age}")
    print(f"  Category: {user_profile.category}")
    print(f"  Annual Income: ₹{user_profile.annual_income:,.2f}")
    print(f"  Education: {user_profile.education_level}")
    print(f"  State: {user_profile.state}")
    
    # Extract PDF content
    print("\n📄 Extracting PDF Content...")
    extractor = PDFExtractor()
    scheme_doc = extractor.create_scheme_document("examples/sample_scheme.pdf")
    
    print(f"\nScheme Document Extracted:")
    print(f"  Title: {scheme_doc.title}")
    print(f"  Content Length: {len(scheme_doc.content)} characters")
    print(f"\nFirst 300 characters of content:")
    print(f"  {scheme_doc.content[:300]}...")
    
    # Basic eligibility check (without AI)
    print("\n🔍 Basic Eligibility Analysis (Rule-Based)...")
    print("\nManual Criteria Check:")
    
    content_lower = scheme_doc.content.lower()
    
    # Check category
    if "obc" in content_lower and user_profile.category == "OBC":
        print("  ✓ Category matches (OBC)")
    else:
        print("  ✗ Category check")
    
    # Check age range
    if user_profile.age >= 18 and user_profile.age <= 30:
        print("  ✓ Age is within typical range (18-30)")
    else:
        print("  ✗ Age check")
    
    # Check income
    if user_profile.annual_income <= 300000:
        print(f"  ✓ Income (₹{user_profile.annual_income:,.0f}) is typically within limits")
    else:
        print("  ✗ Income check")
    
    # Check education
    if user_profile.education_level in ["Undergraduate", "Postgraduate"]:
        print(f"  ✓ Education level ({user_profile.education_level}) is eligible")
    else:
        print("  ✗ Education check")
    
    print("\n" + "=" * 80)
    print("DEMO COMPLETE!")
    print("=" * 80)
    print("\nNOTE: For full AI-powered eligibility analysis and action plan generation,")
    print("run the main.py script with an OpenAI API key:")
    print("  python main.py --pdf examples/sample_scheme.pdf --profile examples/sample_user_profile.json")
    print("=" * 80)


if __name__ == "__main__":
    main()
