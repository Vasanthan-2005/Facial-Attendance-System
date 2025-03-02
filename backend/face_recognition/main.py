from flask import Flask
from register_student import register_bp
from attendance import attendance_bp
from photos import photos_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Allow React frontend

# Register blueprints
app.register_blueprint(register_bp, url_prefix='/register')
app.register_blueprint(attendance_bp, url_prefix='/attendance')
app.register_blueprint(photos_bp, url_prefix='/photos')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
