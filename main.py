#!/usr/bin/env python3
"""
Docu-Agent CLI - Command-line interface for checking scheme eligibility
"""

import argparse
import json
import os
from pathlib import Path
from dotenv import load_dotenv

from docu_agent.pdf_extractor import PDFExtractor
from docu_agent.eligibility_checker import EligibilityChecker
from docu_agent.action_plan_generator import ActionPlanGenerator
from docu_agent.models import UserProfile, Gender, Category, EducationLevel


def load_user_profile_from_json(json_path: str) -> UserProfile:
    """Load user profile from JSON file"""
    with open(json_path, 'r') as f:
        data = json.load(f)
    return UserProfile(**data)


def create_user_profile_interactive() -> UserProfile:
    """Create user profile interactively"""
    print("\n=== User Profile Creation ===")
    
    name = input("Full Name: ")
    age = int(input("Age: "))
    
    print("\nGender: 1) Male, 2) Female, 3) Other")
    gender_choice = input("Select (1-3): ")
    gender_map = {"1": Gender.MALE, "2": Gender.FEMALE, "3": Gender.OTHER}
    gender = gender_map.get(gender_choice, Gender.OTHER)
    
    print("\nCategory: 1) General, 2) OBC, 3) SC, 4) ST, 5) EWS")
    category_choice = input("Select (1-5): ")
    category_map = {"1": Category.GENERAL, "2": Category.OBC, "3": Category.SC, "4": Category.ST, "5": Category.EWS}
    category = category_map.get(category_choice, Category.GENERAL)
    
    annual_income = float(input("Annual Family Income (in ₹): "))
    
    print("\nEducation: 1) High School, 2) Undergraduate, 3) Postgraduate, 4) Doctorate")
    edu_choice = input("Select (1-4): ")
    edu_map = {"1": EducationLevel.HIGH_SCHOOL, "2": EducationLevel.UNDERGRADUATE, 
               "3": EducationLevel.POSTGRADUATE, "4": EducationLevel.DOCTORATE}
    education_level = edu_map.get(edu_choice, EducationLevel.HIGH_SCHOOL)
    
    state = input("State: ")
    district = input("District (optional): ") or None
    
    is_disabled = input("Do you have a disability? (y/n): ").lower() == 'y'
    is_minority = input("Do you belong to a minority community? (y/n): ").lower() == 'y'
    
    return UserProfile(
        name=name,
        age=age,
        gender=gender,
        category=category,
        annual_income=annual_income,
        education_level=education_level,
        state=state,
        district=district,
        is_disabled=is_disabled,
        is_minority=is_minority
    )


def print_eligibility_result(result):
    """Pretty print eligibility result"""
    print("\n" + "="*80)
    print(f"SCHEME: {result.scheme_title}")
    print("="*80)
    
    # Status with color-like indicators
    status_symbol = "✓" if result.status == "Eligible" else "✗" if result.status == "Not Eligible" else "~"
    print(f"\n{status_symbol} STATUS: {result.status}")
    print(f"   Confidence: {result.confidence_score*100:.1f}%")
    
    if result.matched_criteria:
        print(f"\n✓ CRITERIA YOU MEET:")
        for criterion in result.matched_criteria:
            print(f"  • {criterion}")
    
    if result.unmatched_criteria:
        print(f"\n✗ CRITERIA YOU DON'T MEET:")
        for criterion in result.unmatched_criteria:
            print(f"  • {criterion}")
    
    print(f"\nEXPLANATION:")
    print(f"  {result.explanation}")
    
    if result.action_plan:
        print(f"\n📋 ACTION PLAN:")
        for i, step in enumerate(result.action_plan, 1):
            print(f"  {i}. {step}")
    
    print("\n" + "="*80 + "\n")


def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(
        description="Docu-Agent: AI-powered government scheme eligibility checker",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Check eligibility with interactive profile creation
  python main.py --pdf examples/scheme.pdf --interactive
  
  # Check eligibility with profile from JSON file
  python main.py --pdf examples/scheme.pdf --profile user_profile.json
  
  # Save result to file
  python main.py --pdf scheme.pdf --profile user.json --output result.json
        """
    )
    
    parser.add_argument('--pdf', required=True, help='Path to scheme PDF file')
    parser.add_argument('--profile', help='Path to user profile JSON file')
    parser.add_argument('--interactive', action='store_true', 
                       help='Create user profile interactively')
    parser.add_argument('--output', help='Path to save result JSON')
    parser.add_argument('--api-key', help='OpenAI API key (or set OPENAI_API_KEY env var)')
    
    args = parser.parse_args()
    
    # Load environment variables
    load_dotenv()
    
    # Check for API key
    api_key = args.api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OpenAI API key is required.")
        print("Set OPENAI_API_KEY environment variable or use --api-key flag.")
        return 1
    
    # Validate PDF exists
    if not os.path.exists(args.pdf):
        print(f"ERROR: PDF file not found: {args.pdf}")
        return 1
    
    # Get user profile
    if args.interactive:
        user_profile = create_user_profile_interactive()
    elif args.profile:
        if not os.path.exists(args.profile):
            print(f"ERROR: Profile file not found: {args.profile}")
            return 1
        user_profile = load_user_profile_from_json(args.profile)
    else:
        print("ERROR: Either --profile or --interactive must be specified")
        parser.print_help()
        return 1
    
    print("\n🚀 Starting Docu-Agent Analysis...\n")
    
    # Extract PDF content
    print("📄 Extracting text from PDF...")
    extractor = PDFExtractor()
    scheme_doc = extractor.create_scheme_document(args.pdf)
    print(f"   ✓ Extracted {len(scheme_doc.content)} characters")
    
    # Check eligibility
    print("\n🔍 Analyzing eligibility...")
    checker = EligibilityChecker(api_key=api_key)
    result = checker.check_eligibility(user_profile, scheme_doc)
    print("   ✓ Analysis complete")
    
    # Print results
    print_eligibility_result(result)
    
    # Save to file if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result.model_dump(), f, indent=2)
        print(f"✓ Results saved to {args.output}\n")
    
    return 0


if __name__ == "__main__":
    exit(main())
