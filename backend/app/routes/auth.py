from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from flask_mail import Message
import datetime
from app.models.user import User
from app.middleware.auth import jwt_required as custom_jwt_required
from app.utils.helpers import validate_email, validate_password, success_response, error_response
from config import Config

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'user_type', 'company_name', 'industry', 'location']
        for field in required_fields:
            if field not in data:
                return error_response(f"Missing required field: {field}", status=400)
        
        email = data['email'].lower()
        password = data['password']
        
        # Validate email
        if not validate_email(email):
            return error_response("Invalid email format", status=400)
        
        # Validate password
        is_valid, password_message = validate_password(password)
        if not is_valid:
            return error_response(password_message, status=400)
        
        # Check if user already exists
        existing_user = User.find_by_email(email)
        if existing_user and existing_user.data:
            return error_response("User already exists", status=409)
        
        # Create user
        user = User.create(
            email=email,
            password=password,
            user_type=data['user_type'],
            company_name=data['company_name'],
            industry=data['industry'],
            location=data['location'],
            phone=data.get('phone')
        )
        
        # Send verification email using current_app.mail
        try:
            verification_link = f"{Config.FRONTEND_URL}/verify-email/{user.data['verification_token']}"
            
            # Get mail from current_app extensions
            mail = current_app.extensions.get('mail')
            if mail:
                msg = Message(
                    subject="Verify Your Email - Industrial Symbiosis Matchmaker",
                    recipients=[email],
                    html=f"""
                    <h1>Welcome to Industrial Symbiosis Matchmaker!</h1>
                    <p>Please click the link below to verify your email address:</p>
                    <a href="{verification_link}">{verification_link}</a>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                    """
                )
                mail.send(msg)
            else:
                print("Mail extension not available")
        except Exception as e:
            print(f"Error sending email: {e}")
        
        return success_response(
            "Registration successful. Please check your email for verification.",
            data={'user': user.to_dict()},
            status=201
        )
        
    except Exception as e:
        print(f"Registration error: {e}")
        return error_response("Registration failed", error=str(e), status=500)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return error_response("Email and password are required", status=400)
        
        email = data['email'].lower()
        password = data['password']
        
        # Find user
        user = User.find_by_email(email)
        if not user or not user.data:
            return error_response("Invalid credentials", status=401)
        
        # Verify password
        if not user.verify_password(password):
            return error_response("Invalid credentials", status=401)
        
        # Check if user is active
        if not user.data.get('is_active', True):
            return error_response("Account is deactivated", status=403)
        
        # Generate tokens
        access_token, refresh_token = user.generate_tokens()
        
        return success_response(
            "Login successful",
            data={
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict()
            }
        )
        
    except Exception as e:
        print(f"Login error: {e}")
        return error_response("Login failed", error=str(e), status=500)

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)
        
        if not user or not user.data:
            return error_response("User not found", status=401)
        
        access_token = create_access_token(identity=str(user.data['_id']))
        
        return success_response(
            "Token refreshed",
            data={'access_token': access_token}
        )
        
    except Exception as e:
        return error_response("Token refresh failed", error=str(e), status=500)

@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    """Verify user email"""
    try:
        user = User.find_by_verification_token(token)
        
        if not user or not user.data:
            return error_response("Invalid verification token", status=400)
        
        user.verify_email()
        
        return success_response("Email verified successfully")
        
    except Exception as e:
        return error_response("Verification failed", error=str(e), status=500)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email"""
    try:
        data = request.get_json()
        
        if not data.get('email'):
            return error_response("Email is required", status=400)
        
        email = data['email'].lower()
        user = User.find_by_email(email)
        
        if user and user.data:
            # Generate reset token
            reset_token = user.generate_reset_token()
            
            # Send reset email using current_app.mail
            try:
                mail = current_app.extensions.get('mail')
                if mail:
                    reset_link = f"{Config.FRONTEND_URL}/reset-password/{reset_token}"
                    msg = Message(
                        subject="Reset Your Password - Industrial Symbiosis Matchmaker",
                        recipients=[email],
                        html=f"""
                        <h1>Password Reset Request</h1>
                        <p>Click the link below to reset your password:</p>
                        <a href="{reset_link}">{reset_link}</a>
                        <p>This link will expire in 24 hours.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                        """
                    )
                    mail.send(msg)
            except Exception as email_error:
                print(f"Error sending reset email: {email_error}")
        
        # Always return success to prevent email enumeration
        return success_response("If the email exists, a reset link has been sent")
        
    except Exception as e:
        print(f"Forgot password error: {e}")
        return error_response("Failed to send reset email", status=500)

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password"""
    try:
        data = request.get_json()
        
        if not data.get('token') or not data.get('new_password'):
            return error_response("Token and new password are required", status=400)
        
        token = data['token']
        new_password = data['new_password']
        
        # Validate password
        is_valid, password_message = validate_password(new_password)
        if not is_valid:
            return error_response(password_message, status=400)
        
        user = User.find_by_reset_token(token)
        
        if not user or not user.data:
            return error_response("Invalid or expired reset token", status=400)
        
        # Check if token is expired
        expires_at = user.data.get('reset_token_expires')
        if expires_at and expires_at < datetime.datetime.utcnow():
            return error_response("Reset token has expired", status=400)
        
        user.reset_password(new_password)
        
        return success_response("Password reset successful")
        
    except Exception as e:
        return error_response("Password reset failed", error=str(e), status=500)

@auth_bp.route('/me', methods=['GET'])
@custom_jwt_required
def get_current_user(current_user):
    """Get current user profile"""
    return success_response(
        "User profile retrieved",
        data={'user': current_user.to_dict()}
    )

@auth_bp.route('/logout', methods=['POST'])
@custom_jwt_required
def logout(current_user):
    """Logout user (client-side token removal only)"""
    return success_response("Logout successful")