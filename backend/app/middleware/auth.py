from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User

def jwt_required(fn):
    """Custom JWT required decorator with user loading"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            current_user = User.find_by_id(user_id)
            
            if not current_user or not current_user.data:
                return jsonify({'error': 'User not found'}), 401
            
            return fn(current_user=current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid or expired token'}), 401
    
    return wrapper

def verified_required(fn):
    """Decorator to require email verification"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            current_user = User.find_by_id(user_id)
            
            if not current_user or not current_user.data:
                return jsonify({'error': 'User not found'}), 401
            
            if not current_user.data.get('is_verified', False):
                return jsonify({'error': 'Email verification required'}), 403
            
            return fn(current_user=current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid or expired token'}), 401
    
    return wrapper