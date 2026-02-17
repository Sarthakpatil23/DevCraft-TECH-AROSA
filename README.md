# Docu-Agent: AI-Powered Government Scheme Eligibility Checker

**Docu-Agent** is an intelligent AI system that reads complex government scheme and scholarship PDFs, extracts eligibility rules, and compares them with a user's profile to provide a clear **Eligible/Not Eligible** decision along with a step-by-step action plan. The goal is to turn dense bureaucratic documents into actionable guidance so students and citizens don't miss life-changing opportunities.

## 🌟 Features

- **📄 PDF Processing**: Automatically extracts text from government scheme PDFs
- **🤖 AI-Powered Analysis**: Uses advanced AI to understand complex eligibility criteria
- **✅ Smart Eligibility Checking**: Compares user profiles against scheme requirements
- **📋 Action Plans**: Generates step-by-step guides for applying to schemes
- **💡 Clear Explanations**: Provides detailed reasoning for eligibility decisions
- **🎯 Confidence Scoring**: Shows confidence level in eligibility determinations

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sarthakpatil23/DevCraft-TECH-AROSA.git
cd DevCraft-TECH-AROSA
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your OpenAI API key:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### Usage

#### Option 1: Interactive Mode (Recommended for first-time users)

```bash
python main.py --pdf examples/sample_scheme.pdf --interactive
```

This will guide you through creating a user profile interactively.

#### Option 2: Using a Profile JSON File

```bash
python main.py --pdf examples/sample_scheme.pdf --profile examples/sample_user_profile.json
```

#### Option 3: Save Results to File

```bash
python main.py --pdf path/to/scheme.pdf --profile user_profile.json --output result.json
```

### Example Output

```
🚀 Starting Docu-Agent Analysis...

📄 Extracting text from PDF...
   ✓ Extracted 2248 characters

🔍 Analyzing eligibility...
   ✓ Analysis complete

================================================================================
SCHEME: National Scholarship Portal - Post Matric Scholarship for OBC Students
================================================================================

✓ STATUS: Eligible
   Confidence: 95.0%

✓ CRITERIA YOU MEET:
  • Belongs to OBC category
  • Age is within 18-30 years range
  • Annual income (₹250,000) is below the limit of ₹300,000
  • Currently pursuing undergraduate education

EXPLANATION:
  The user meets all major eligibility criteria for this scholarship scheme...

📋 ACTION PLAN:
  1. Obtain a valid OBC certificate from competent authority
  2. Get income certificate (not older than 6 months)
  3. Gather mark sheets from previous qualifying examination
  4. Visit scholarships.gov.in and register
  5. Fill application form and upload all documents
  6. Submit before October 31st deadline
  7. Note down application ID for tracking

================================================================================
```

## 📖 How It Works

1. **PDF Extraction**: The system reads government scheme PDFs and extracts all text content
2. **Criteria Extraction**: AI analyzes the document to identify eligibility rules (age, income, category, education, etc.)
3. **Profile Matching**: User profile is compared against extracted criteria
4. **Decision Generation**: AI determines eligibility status with confidence score
5. **Action Planning**: If eligible, generates a detailed step-by-step application guide

## 🏗️ Architecture

```
docu_agent/
├── __init__.py              # Package initialization
├── models.py                # Data models (UserProfile, SchemeDocument, etc.)
├── pdf_extractor.py         # PDF text extraction
├── eligibility_checker.py   # AI-powered eligibility analysis
└── action_plan_generator.py # Action plan generation

main.py                      # CLI interface
examples/                    # Sample files
├── sample_scheme.pdf        # Example government scheme
└── sample_user_profile.json # Example user profile
```

## 📝 User Profile Format

Create a JSON file with the following structure:

```json
{
  "name": "Your Name",
  "age": 20,
  "gender": "Male",
  "category": "OBC",
  "annual_income": 250000,
  "education_level": "Undergraduate",
  "state": "Maharashtra",
  "district": "Mumbai",
  "is_disabled": false,
  "is_minority": false
}
```

### Valid Values

- **gender**: "Male", "Female", "Other"
- **category**: "General", "OBC", "SC", "ST", "EWS"
- **education_level**: "High School", "Undergraduate", "Postgraduate", "Doctorate"

## 🔧 API Usage (Programmatic)

You can also use Docu-Agent as a library in your Python code:

```python
from docu_agent import PDFExtractor, EligibilityChecker, UserProfile

# Extract PDF content
extractor = PDFExtractor()
scheme_doc = extractor.create_scheme_document("scheme.pdf")

# Create user profile
user_profile = UserProfile(
    name="John Doe",
    age=20,
    gender="Male",
    category="OBC",
    annual_income=250000,
    education_level="Undergraduate",
    state="Maharashtra"
)

# Check eligibility
checker = EligibilityChecker(api_key="your-openai-key")
result = checker.check_eligibility(user_profile, scheme_doc)

print(f"Status: {result.status}")
print(f"Explanation: {result.explanation}")
print(f"Action Plan: {result.action_plan}")
```

## 🎯 Use Cases

- **Students**: Check eligibility for scholarships and educational schemes
- **Citizens**: Evaluate qualification for government welfare programs
- **NGOs**: Help beneficiaries identify suitable schemes
- **Government Portals**: Integrate as an eligibility pre-screening tool
- **Educational Counselors**: Guide students to appropriate opportunities

## 🛠️ Development

### Running Tests

```bash
pytest tests/
```

### Project Structure

The project follows a modular architecture:
- **Models**: Pydantic models for type safety and validation
- **Extractors**: PDF processing and text extraction
- **Checkers**: AI-powered eligibility analysis
- **Generators**: Action plan creation
- **CLI**: User-friendly command-line interface

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with OpenAI's GPT models for intelligent document analysis
- PDF processing powered by PyMuPDF
- Data validation with Pydantic

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Made with ❤️ to help citizens access life-changing opportunities**