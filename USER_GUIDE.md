# Docu-Agent User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Usage Examples](#usage-examples)
5. [Understanding Results](#understanding-results)
6. [Troubleshooting](#troubleshooting)

## Introduction

Docu-Agent is an AI-powered system that helps you determine eligibility for government schemes and scholarships. Simply provide:
- A PDF of the government scheme
- Your personal profile
- An OpenAI API key

Docu-Agent will analyze the eligibility criteria and tell you whether you qualify, along with step-by-step instructions on how to apply.

## Installation

### Step 1: Install Python
Ensure you have Python 3.8 or higher installed. Check with:
```bash
python --version
```

### Step 2: Clone the Repository
```bash
git clone https://github.com/Sarthakpatil23/DevCraft-TECH-AROSA.git
cd DevCraft-TECH-AROSA
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Set Up API Key
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

## Getting Started

### Quick Demo (No API Key Required)
Run the demo to see basic functionality:
```bash
python demo.py
```

This demonstrates PDF extraction and basic profile matching without making API calls.

### Full Analysis (Requires API Key)

#### Option 1: Interactive Mode
Best for first-time users:
```bash
python main.py --pdf examples/sample_scheme.pdf --interactive
```

Follow the prompts to enter your information.

#### Option 2: Using a Profile File
Create a JSON file with your profile (see [Profile Format](#profile-format)) and run:
```bash
python main.py --pdf examples/sample_scheme.pdf --profile your_profile.json
```

## Usage Examples

### Example 1: Check Scholarship Eligibility
```bash
python main.py \
  --pdf scholarships/national_scholarship.pdf \
  --profile my_profile.json
```

### Example 2: Save Results to File
```bash
python main.py \
  --pdf schemes/housing_scheme.pdf \
  --profile my_profile.json \
  --output result.json
```

### Example 3: Specify API Key Directly
```bash
python main.py \
  --pdf scheme.pdf \
  --profile profile.json \
  --api-key sk-your-key-here
```

## Profile Format

Create a JSON file with your personal information:

```json
{
  "name": "Your Full Name",
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

### Field Descriptions

| Field | Type | Valid Values | Description |
|-------|------|--------------|-------------|
| name | string | Any | Your full name |
| age | number | 0-150 | Your age in years |
| gender | string | "Male", "Female", "Other" | Your gender |
| category | string | "General", "OBC", "SC", "ST", "EWS" | Social category |
| annual_income | number | ≥ 0 | Annual family income in rupees |
| education_level | string | "High School", "Undergraduate", "Postgraduate", "Doctorate" | Current education level |
| state | string | Any | State of residence |
| district | string | Any (optional) | District of residence |
| is_disabled | boolean | true/false | Whether you have a disability |
| is_minority | boolean | true/false | Whether you belong to minority community |

## Understanding Results

### Result Structure

The system provides:

1. **Status**: Eligible / Not Eligible / Partially Eligible
2. **Confidence Score**: How confident the AI is (0-100%)
3. **Matched Criteria**: Requirements you meet
4. **Unmatched Criteria**: Requirements you don't meet
5. **Explanation**: Detailed reasoning
6. **Action Plan**: Step-by-step guide to apply

### Sample Output

```
================================================================================
SCHEME: Post Matric Scholarship for OBC Students
================================================================================

✓ STATUS: Eligible
   Confidence: 95.0%

✓ CRITERIA YOU MEET:
  • Belongs to OBC category
  • Age is within 18-30 years range
  • Annual income below ₹3,00,000
  • Currently pursuing undergraduate education

EXPLANATION:
  You meet all the major eligibility criteria for this scholarship...

📋 ACTION PLAN:
  1. Obtain valid OBC certificate from competent authority
  2. Get income certificate (not older than 6 months)
  3. Collect mark sheets from previous examination
  ...
```

## Troubleshooting

### Common Issues

#### 1. "OpenAI API key is required"
**Solution**: Set your API key in `.env` file or use `--api-key` flag

#### 2. "PDF file not found"
**Solution**: Check the path to your PDF file. Use absolute paths if needed.

#### 3. "ModuleNotFoundError"
**Solution**: Install dependencies: `pip install -r requirements.txt`

#### 4. PDF extraction returns empty text
**Solution**: Ensure your PDF contains selectable text (not scanned images). Use OCR tools for scanned documents.

#### 5. API rate limits
**Solution**: Wait a few minutes between requests or upgrade your OpenAI plan.

### Getting Help

For issues or questions:
1. Check this guide
2. Review example files in `examples/` directory
3. Run `python main.py --help`
4. Open an issue on GitHub

## Best Practices

1. **Keep Profile Updated**: Regularly update your profile JSON with current information
2. **Original PDFs**: Use original government PDFs when possible for best results
3. **Review Results**: Always review the AI's analysis and verify with official sources
4. **Save Results**: Use `--output` to keep records of eligibility checks
5. **Multiple Schemes**: Check multiple schemes to find all opportunities you qualify for

## Privacy & Security

- Your data is only sent to OpenAI for analysis
- No data is stored by Docu-Agent
- Keep your API key secure and never share it
- Review OpenAI's privacy policy for details on data handling

## Next Steps

After getting your eligibility results:
1. Follow the action plan provided
2. Gather required documents
3. Apply before deadlines
4. Keep track of your application
5. Check multiple schemes for more opportunities

---

Happy scheme hunting! 🎯
