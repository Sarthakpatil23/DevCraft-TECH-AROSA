# Docu-Agent Architecture

## Overview

Docu-Agent is designed as a modular, extensible system for analyzing government scheme eligibility. The architecture follows clean separation of concerns with distinct modules for each responsibility.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│                    (CLI / API / Future Web)                  │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│                      Main Orchestrator                         │
│                    (main.py / docu_agent)                      │
└─┬─────────────┬──────────────┬──────────────┬────────────────┘
  │             │              │              │
  ▼             ▼              ▼              ▼
┌─────────┐ ┌──────────┐ ┌────────────┐ ┌─────────────────┐
│   PDF   │ │Eligibility│ │   Action   │ │  Data Models   │
│Extractor│ │  Checker  │ │    Plan    │ │  (Pydantic)    │
└─────────┘ └──────────┘ └────────────┘ └─────────────────┘
     │            │              │               │
     └────────────┴──────────────┴───────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   OpenAI GPT-4   │
              │   (AI Analysis)  │
              └──────────────────┘
```

## Core Components

### 1. Data Models (`docu_agent/models.py`)

**Purpose**: Define structured data types using Pydantic for type safety and validation.

**Key Models**:
- `UserProfile`: User's personal information
- `SchemeDocument`: Government scheme document data
- `EligibilityCriteria`: Extracted eligibility rules
- `EligibilityResult`: Final eligibility determination

**Design Decisions**:
- Used Pydantic for automatic validation
- Enums for categorical data (Gender, Category, etc.)
- Optional fields for flexible data handling
- Clear field descriptions for documentation

### 2. PDF Extractor (`docu_agent/pdf_extractor.py`)

**Purpose**: Extract text content from PDF documents.

**Technology**: PyMuPDF (fitz)

**Key Methods**:
- `extract_text_from_pdf()`: Raw text extraction
- `create_scheme_document()`: Create structured document object

**Design Decisions**:
- Chose PyMuPDF for reliability and speed
- Simple, focused interface
- Error handling for missing/corrupt PDFs
- Automatic title generation from filename

### 3. Eligibility Checker (`docu_agent/eligibility_checker.py`)

**Purpose**: Use AI to analyze eligibility criteria and match against user profiles.

**Technology**: OpenAI GPT-4 API

**Key Methods**:
- `extract_eligibility_criteria()`: Parse criteria from document
- `check_eligibility()`: Compare user against criteria

**Design Decisions**:
- Two-phase approach: criteria extraction, then matching
- Structured JSON output for reliability
- Low temperature for consistent results
- Confidence scoring for transparency
- Graceful error handling

**AI Prompt Strategy**:
1. Clear role definition (expert assistant)
2. Structured input (profile + document)
3. JSON response format for parsing
4. Specific output requirements

### 4. Action Plan Generator (`docu_agent/action_plan_generator.py`)

**Purpose**: Generate step-by-step application guides.

**Key Methods**:
- `generate_action_plan()`: Create actionable steps

**Design Decisions**:
- Conditional logic based on eligibility status
- Context-aware (includes scheme details)
- Fallback to generic steps on API failure
- Numbered, sequential format

### 5. CLI Interface (`main.py`)

**Purpose**: Provide user-friendly command-line interface.

**Features**:
- Interactive profile creation
- JSON profile loading
- Progress indicators
- Formatted output
- Result saving

**Design Decisions**:
- argparse for standard CLI patterns
- Emoji for visual appeal
- Clear error messages
- Help text with examples

## Data Flow

### Complete Analysis Flow

```
1. User Input
   ├─ PDF file path
   └─ User profile (JSON or interactive)
   
2. PDF Processing
   ├─ Extract text from PDF
   └─ Create SchemeDocument object
   
3. AI Analysis Phase 1: Criteria Extraction
   ├─ Send document to GPT-4
   ├─ Extract structured criteria
   └─ Populate EligibilityCriteria
   
4. AI Analysis Phase 2: Eligibility Matching
   ├─ Compare UserProfile to EligibilityCriteria
   ├─ Identify matched/unmatched criteria
   ├─ Generate confidence score
   └─ Create explanation
   
5. AI Analysis Phase 3: Action Plan
   ├─ Generate application steps (if eligible)
   └─ Provide guidance
   
6. Output
   ├─ Display formatted results
   └─ Optional: Save to JSON file
```

## Design Patterns

### 1. Dependency Injection
- Components accept API keys as parameters
- Allows testing without actual API calls
- Configuration flexibility

### 2. Single Responsibility
- Each module has one clear purpose
- Easy to test and maintain
- Can be used independently

### 3. Error Handling Strategy
- Validate inputs early
- Graceful degradation (fallback responses)
- Clear error messages to users

### 4. Extensibility
- Easy to add new criteria types
- Can support multiple AI models
- Pluggable extractors for different formats

## Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| PDF Extraction | PyMuPDF | Fast, reliable, handles complex PDFs |
| Data Models | Pydantic | Type safety, validation, serialization |
| AI/LLM | OpenAI GPT-4 | Best understanding of complex documents |
| CLI | argparse | Standard Python library, feature-rich |
| Testing | pytest | Industry standard, great fixtures |

## Security Considerations

1. **API Key Handling**
   - Never committed to version control
   - Environment variable support
   - Clear documentation

2. **Input Validation**
   - Pydantic validates all data models
   - File existence checks
   - Error handling for malformed PDFs

3. **Data Privacy**
   - No data persistence by default
   - All processing in-memory
   - User controls data sharing with OpenAI

## Testing Strategy

### Test Levels

1. **Unit Tests** (`tests/test_models.py`, `tests/test_pdf_extractor.py`)
   - Test individual components
   - No external dependencies
   - Fast execution

2. **Integration Tests** (`tests/test_integration.py`)
   - Test component interactions
   - Use sample data
   - Validate end-to-end flow (without API)

3. **Manual Testing**
   - Demo script for quick validation
   - Sample data provided
   - CLI testing with help text

### Test Philosophy
- Test what you can without API keys
- Provide sample data for reproducibility
- Focus on business logic
- Mock external dependencies when needed

## Future Enhancements

### Potential Improvements

1. **Multi-language Support**
   - Support PDFs in regional languages
   - Translated UI

2. **Batch Processing**
   - Check multiple schemes at once
   - Comparison reports

3. **OCR Integration**
   - Handle scanned PDFs
   - Image-based documents

4. **Web Interface**
   - Browser-based UI
   - Upload files directly
   - Save user profiles

5. **Notification System**
   - Email alerts for new schemes
   - Deadline reminders

6. **Document Database**
   - Cache processed schemes
   - Faster repeated checks

7. **Multiple AI Providers**
   - Support Claude, Gemini, etc.
   - Provider selection based on cost/quality

## Performance Considerations

### Current Performance
- PDF extraction: < 1 second
- AI analysis: 5-15 seconds per request
- Memory usage: Minimal (in-memory processing)

### Optimization Opportunities
1. Cache AI responses for identical queries
2. Parallel processing for multiple schemes
3. Streaming responses for large documents
4. Local LLM option for privacy-sensitive use

## Maintenance Guidelines

### Code Standards
- Type hints for all functions
- Docstrings for all public methods
- Consistent error handling
- Clear variable names

### Version Control
- Semantic versioning
- Clear commit messages
- Feature branches
- PR reviews

### Documentation
- Keep README updated
- Document breaking changes
- Maintain examples
- Update architecture docs

---

**Last Updated**: February 2026
**Version**: 1.0.0
