from datetime import datetime, timedelta
import bcrypt
import secrets
from flask import current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from app.database.mongodb import get_db
from bson.objectid import ObjectId

class User:
    def __init__(self, user_data):
        self.data = user_data if user_data else None
    
    @staticmethod
    def create(email, password, user_type, company_name, industry, location, phone=None):
        """Create a new user"""
        db = get_db()
        
        # Hash password
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        user = {
            'email': email,
            'password_hash': password_hash,
            'user_type': user_type,  # 'factory' or 'business'
            'company_name': company_name,
            'industry': industry,
            'location': location,
            'phone': phone,
            'is_verified': False,
            'verification_token': secrets.token_urlsafe(32),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True
        }
        
        result = db.users.insert_one(user)
        user['_id'] = result.inserted_id
        
        return User(user)
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        db = get_db()
        user_data = db.users.find_one({'email': email})
        return User(user_data) if user_data else None
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        db = get_db()
        try:
            user_data = db.users.find_one({'_id': ObjectId(user_id)})
            return User(user_data) if user_data else None
        except:
            return None
    
    @staticmethod
    def find_by_verification_token(token):
        """Find user by verification token"""
        db = get_db()
        user_data = db.users.find_one({'verification_token': token})
        return User(user_data) if user_data else None
    
    @staticmethod
    def find_by_reset_token(token):
        """Find user by password reset token"""
        db = get_db()
        user_data = db.users.find_one({'reset_token': token})
        return User(user_data) if user_data else None
    
    def verify_password(self, password):
        """Verify user password"""
        if not self.data:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.data['password_hash'])
    
    def generate_tokens(self):
        """Generate access and refresh tokens"""
        access_token = create_access_token(identity=str(self.data['_id']))
        refresh_token = create_refresh_token(identity=str(self.data['_id']))
        return access_token, refresh_token
    
    def verify_email(self):
        """Mark user as verified"""
        db = get_db()
        db.users.update_one(
            {'_id': self.data['_id']},
            {
                '$set': {
                    'is_verified': True,
                    'verified_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                },
                '$unset': {'verification_token': ''}
            }
        )
        self.data['is_verified'] = True
    
    def generate_reset_token(self):
        """Generate password reset token"""
        reset_token = secrets.token_urlsafe(32)
        db = get_db()
        db.users.update_one(
            {'_id': self.data['_id']},
            {
                '$set': {
                    'reset_token': reset_token,
                    'reset_token_expires': datetime.utcnow() + timedelta(hours=24),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        self.data['reset_token'] = reset_token
        return reset_token
    
    def reset_password(self, new_password):
        """Reset user password"""
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), salt)
        
        db = get_db()
        db.users.update_one(
            {'_id': self.data['_id']},
            {
                '$set': {
                    'password_hash': password_hash,
                    'updated_at': datetime.utcnow()
                },
                '$unset': {'reset_token': '', 'reset_token_expires': ''}
            }
        )
    
    def to_dict(self):
        """Convert user to dictionary (safe for API)"""
        if not self.data:
            return None
        return {
            'id': str(self.data['_id']),
            'email': self.data['email'],
            'user_type': self.data['user_type'],
            'company_name': self.data['company_name'],
            'industry': self.data['industry'],
            'location': self.data['location'],
            'phone': self.data.get('phone'),
            'is_verified': self.data['is_verified'],
            'created_at': self.data['created_at'].isoformat() if self.data.get('created_at') else None
        }