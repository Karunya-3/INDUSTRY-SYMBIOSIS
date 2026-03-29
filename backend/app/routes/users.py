from flask import Blueprint, make_response, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from bson.objectid import ObjectId

users_bp = Blueprint('users', __name__)


@users_bp.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return '', 200
    
@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get data from request
        data = request.get_json()
        
        # Fields to update
        update_data = {}
        updatable_fields = ['company_name', 'email', 'industry', 'location', 'phone']
        
        for field in updatable_fields:
            if field in data:
                update_data[field] = data[field]
        
        # Update the profile
        try:
            user.update_profile(**update_data)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/profile/<user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    """Get any user profile (for public viewing)"""
    try:
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Return only public information
        user_data = user.to_dict()
        # Remove sensitive information if any
        user_data.pop('email', None)  # Don't expose email to other users
        
        return jsonify(user_data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500