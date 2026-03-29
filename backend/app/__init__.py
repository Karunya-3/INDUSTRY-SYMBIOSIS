from flask import Flask, request, make_response
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

    CORS(app,
         origins=["http://localhost:5173"],
         supports_credentials=True)

    # ✅ ONLY ONE handler (correct)
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response('', 200)
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response

    jwt.init_app(app)
    mail.init_app(app)

    from app.routes import auth_bp, users_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')

    from app.database.mongodb import init_db
    init_db(app)
    
    print(app.url_map)

    return app