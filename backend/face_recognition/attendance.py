from flask import Blueprint, request, jsonify
from flask_cors import CORS
import os
import pickle
import cv2
import numpy as np
import face_recognition
import requests
import base64
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv

attendance_bp = Blueprint("attendance", __name__)
CORS(attendance_bp, resources={r"/*": {"origins": "http://localhost:3000"}})

load_dotenv()

base_url = os.getenv("URL")

DB_PATH = './db'  # Path to stored student face encodings
ATTENDANCE_API = f"{base_url}/api/students/mark"  # Ensure correct backend API URL

def recognize(img, db_path, tolerance=0.4):
    """Recognizes face by comparing it with the database"""
    embeddings_unknown = face_recognition.face_encodings(img)
    if len(embeddings_unknown) == 0:
        return 'no_persons_found'
    embeddings_unknown = embeddings_unknown[0]
    
    encodings = {}
    for file in os.listdir(db_path):
        if file.endswith(".pickle"):
            with open(os.path.join(db_path, file), 'rb') as f:
                encodings[file.split(".")[0]] = pickle.load(f)

    for name, known_encoding in encodings.items():
        matches = face_recognition.compare_faces([known_encoding], embeddings_unknown, tolerance)
        if matches[0]:
            return name
    return 'unknown_person'

def base64_to_image(base64_string):
    """Convert base64 string to OpenCV image"""
    try:
        image_data = base64.b64decode(base64_string.split(',')[1])
        image = Image.open(BytesIO(image_data))
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as e:
        print("Error decoding base64 image:", e)
        return None

def mark_attendance(student_id):
    """Mark attendance for the student by calling the backend API."""
    payload = {"student_id": student_id}
    try:
        response = requests.post(ATTENDANCE_API, json=payload)
        response_data = response.json()
        response_data["success"] = response.status_code == 201
        return response_data, response.status_code
    except requests.exceptions.RequestException as e:
        return {"success": False, "message": f"Attendance API error: {str(e)}"}, 500

@attendance_bp.route('/recognize', methods=['POST'])
def recognize_student():
    """Receives image from frontend, recognizes student, and marks attendance"""
    data = request.get_json()
    if 'image' not in data:
        return jsonify({"success": False, "message": "No image provided"}), 400
    
    image = base64_to_image(data['image'])
    if image is None:
        return jsonify({"success": False, "message": "Invalid image format"}), 400
    
    student_id = recognize(image, DB_PATH)
    if student_id in ['unknown_person', 'no_persons_found']:
        return jsonify({"success": False, "message": "Student not found"}), 404
    
    return jsonify(mark_attendance(student_id))
