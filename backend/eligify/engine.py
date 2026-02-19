"""
Deterministic Eligibility Engine.

Compares user profile fields against extracted rules using strict operators.
NO AI is used here — purely rule-based evaluation.
"""

import logging
from datetime import date, datetime

logger = logging.getLogger(__name__)


def _parse_numeric(value) -> float | None:
    """Try to parse a value as a number. Handles strings like '5,00,000', '₹6000', '85.5%'."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, bool):
        return 1.0 if value else 0.0
    s = str(value).strip()
    # Remove common prefixes/suffixes
    for ch in ['₹', 'Rs', 'Rs.', 'INR', '%', ',', ' ']:
        s = s.replace(ch, '')
    s = s.strip()
    try:
        return float(s)
    except (ValueError, TypeError):
        return None


def _compute_age(dob) -> int | None:
    """Compute age from a date or date string."""
    if not dob:
        return None
    if isinstance(dob, str):
        for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y'):
            try:
                dob = datetime.strptime(dob, fmt).date()
                break
            except ValueError:
                continue
        else:
            return None
    if isinstance(dob, date):
        today = date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return None


def _get_user_value(profile_data: dict, field: str):
    """Get domain-mapped value from the user profile dict."""
    if field == 'age':
        return _compute_age(profile_data.get('dob'))
    if field == 'family_members_count':
        members = profile_data.get('family_members', [])
        return len(members) if isinstance(members, list) else 0
    return profile_data.get(field)


def _evaluate_rule(user_value, operator: str, expected_value) -> str:
    """
    Evaluate a single rule. Returns:
      'satisfied'     — condition met
      'not-satisfied' — condition clearly not met
      'missing'       — user data is missing / cannot evaluate
    """
    if user_value is None or user_value == '' or user_value == []:
        return 'missing'

    op = operator.lower().strip()

    # Boolean equality
    if op == '==' or op == 'eq':
        if isinstance(expected_value, bool):
            if isinstance(user_value, bool):
                return 'satisfied' if user_value == expected_value else 'not-satisfied'
            # Handle string 'true'/'false'
            return 'satisfied' if str(user_value).lower() == str(expected_value).lower() else 'not-satisfied'
        # String equality (case-insensitive)
        if isinstance(expected_value, str) and isinstance(user_value, str):
            return 'satisfied' if user_value.lower().strip() == expected_value.lower().strip() else 'not-satisfied'
        # Numeric equality
        uv = _parse_numeric(user_value)
        ev = _parse_numeric(expected_value)
        if uv is not None and ev is not None:
            return 'satisfied' if uv == ev else 'not-satisfied'
        return 'satisfied' if str(user_value) == str(expected_value) else 'not-satisfied'

    if op == '!=' or op == 'neq':
        result = _evaluate_rule(user_value, '==', expected_value)
        if result == 'satisfied':
            return 'not-satisfied'
        elif result == 'not-satisfied':
            return 'satisfied'
        return result

    # Numeric comparisons
    if op in ('<', '>', '<=', '>=', 'lt', 'gt', 'lte', 'gte'):
        uv = _parse_numeric(user_value)
        ev = _parse_numeric(expected_value)
        if uv is None or ev is None:
            return 'missing'
        op_map = {
            '<': uv < ev, 'lt': uv < ev,
            '>': uv > ev, 'gt': uv > ev,
            '<=': uv <= ev, 'lte': uv <= ev,
            '>=': uv >= ev, 'gte': uv >= ev,
        }
        return 'satisfied' if op_map[op] else 'not-satisfied'

    # In / not_in
    if op == 'in':
        if isinstance(expected_value, list):
            # Case-insensitive match for strings
            user_str = str(user_value).lower().strip()
            expected_lower = [str(v).lower().strip() for v in expected_value]
            return 'satisfied' if user_str in expected_lower else 'not-satisfied'
        return 'missing'

    if op == 'not_in':
        if isinstance(expected_value, list):
            user_str = str(user_value).lower().strip()
            expected_lower = [str(v).lower().strip() for v in expected_value]
            return 'satisfied' if user_str not in expected_lower else 'not-satisfied'
        return 'missing'

    # Between
    if op == 'between':
        if isinstance(expected_value, list) and len(expected_value) == 2:
            uv = _parse_numeric(user_value)
            low = _parse_numeric(expected_value[0])
            high = _parse_numeric(expected_value[1])
            if uv is not None and low is not None and high is not None:
                return 'satisfied' if low <= uv <= high else 'not-satisfied'
        return 'missing'

    # Exists
    if op == 'exists':
        return 'satisfied' if user_value else 'missing'

    logger.warning(f"Unknown operator: {op}")
    return 'missing'


def evaluate_eligibility(profile_data: dict, extracted_rules: list) -> dict:
    """
    Run all extracted rules against the user profile.

    Args:
        profile_data: dict from UserProfile (flat fields + computed values)
        extracted_rules: list of rule dicts from Gemini extraction

    Returns:
        {
            'conditions': [
                { 'label', 'status', 'detail', 'yourValue', 'required', 'field' }
            ],
            'match_percentage': int,
            'status': 'Eligible' | 'Partial' | 'Not Eligible'
        }
    """
    conditions = []
    total_rules = len(extracted_rules) if extracted_rules else 0

    if total_rules == 0:
        return {
            'conditions': [],
            'match_percentage': 0,
            'status': 'Not Eligible',
        }

    satisfied_count = 0

    for rule in extracted_rules:
        field = rule.get('field', '')
        label = rule.get('label', field)
        operator = rule.get('operator', 'exists')
        expected_value = rule.get('value')
        detail = rule.get('detail', '')

        user_value = _get_user_value(profile_data, field)
        status = _evaluate_rule(user_value, operator, expected_value)

        if status == 'satisfied':
            satisfied_count += 1

        # Format display values
        your_value_display = ''
        if user_value is not None and user_value != '' and user_value != []:
            your_value_display = str(user_value)
        elif status == 'missing':
            your_value_display = 'Not provided'

        required_display = ''
        if expected_value is not None:
            if isinstance(expected_value, list):
                required_display = ', '.join(str(v) for v in expected_value)
            else:
                required_display = str(expected_value)

        conditions.append({
            'label': label,
            'status': status,
            'detail': detail,
            'yourValue': your_value_display,
            'required': required_display,
            'field': field,
        })

    match_percentage = round((satisfied_count / total_rules) * 100)

    if match_percentage == 100:
        overall_status = 'Eligible'
    elif match_percentage >= 50:
        overall_status = 'Partial'
    else:
        overall_status = 'Not Eligible'

    return {
        'conditions': conditions,
        'match_percentage': match_percentage,
        'status': overall_status,
    }
