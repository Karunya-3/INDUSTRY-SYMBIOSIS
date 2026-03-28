import re
from flask import jsonify

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

def success_response(message, data=None, status=200):
    """Create success response"""
    response = {'success': True, 'message': message}
    if data:
        response['data'] = data
    return jsonify(response), status

def error_response(message, error=None, status=400):
    """Create error response"""
    response = {'success': False, 'message': message}
    if error:
        response['error'] = error
    return jsonify(response), status