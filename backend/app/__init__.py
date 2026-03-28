from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from config import Config

# Initialize extensions
jwt = JWTManager()
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
    jwt.init_app(app)
    mail.init_app(app)
    
    # Register blueprints
    from app.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Import and initialize database
    from app.database.mongodb import init_db
    init_db(app)
    
    return app