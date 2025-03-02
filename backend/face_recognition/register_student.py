import cv2
import os
import pickle
import face_recognition
import requests
import base64
import numpy as np
import traceback
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

register_bp = Blueprint("register", __name__)  # Create a Blueprint

load_dotenv()
base_url = os.getenv("URL")

DB_PATH = './db'

def encode_image(image):
    """Encodes face from an image"""
    encodings = face_recognition.face_encodings(image)
    return encodings[0] if len(encodings) > 0 else None

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

def is_face_already_registered(img, db_path, tolerance=0.4):
    return recognize(img, db_path, tolerance) not in ['unknown_person', 'no_persons_found']

def store_face_encoding(student_id, img, db_path):
    """Stores face encoding in database"""
    face_encoding = encode_image(img)
    with open(os.path.join(db_path, f"{student_id}.pickle"), 'wb') as f:
        pickle.dump(face_encoding, f)

def register_student(student_id, name, email, department, parent_no):
    """Registers a new student by sending data to the backend"""
    payload = {
        "student_id": student_id,
        "name": name,
        "email": email,
        "department": department,
        "parent_no": parent_no,
    }
    try:
        response = requests.post(f"{base_url}/api/students/register", json=payload)

        if response.status_code == 201:
            return True, None  
        else:
            try:
                error_data = response.json()  
            except ValueError:
                error_data = {"error": response.text}  

            return False, error_data  
    except requests.exceptions.RequestException as e:
        return False, {"error": str(e)}  

def save_image_if_registered(student_id, frame):
    """Save the image only if the student is registered"""
    save_folder = "./uploads"
    os.makedirs(save_folder, exist_ok=True)
    image_path = os.path.join(save_folder, f"{student_id}.jpg")
    cv2.imwrite(image_path, frame)

@register_bp.route('/register_student', methods=['POST'])
def register_student_api():
    try:
        data = request.json
        student_id = data.get("student_id")
        name = data.get("name")
        email = data.get("email")
        department = data.get("department")
        parent_no = data.get("parent_no")
        face_image_base64 = data.get("face_image")
        
        print(data)

        # Validate input fields
        if not all([student_id, name, email, department, parent_no, face_image_base64]):
            return jsonify({"error": "All fields are required!"}), 400

        # Decode Base64 image
        try:
            face_image_base64 = face_image_base64.strip()
            face_image_data = base64.b64decode(face_image_base64.split(",")[1])
            
            face_image_np = np.frombuffer(face_image_data, dtype=np.uint8)
            img = cv2.imdecode(face_image_np, cv2.IMREAD_COLOR)
            if img is None:
                print("Failed to decode image!")
                return jsonify({"error": "Failed to decode image!"}), 400
            print("Image decoded successfully!")
        except Exception:
            return jsonify({"error": "Invalid image format!"}), 400

        # Check if face is already registered
        if is_face_already_registered(img, DB_PATH):
            return jsonify({"error": "Face already registered!"}), 409

        # Encode face       
        face_encoding = encode_image(img)
        if face_encoding is None:
            return jsonify({"error": "No face detected!"}), 400

        # Register student in database
        success, error_msg = register_student(student_id, name, email, department, parent_no)

        if success:
            store_face_encoding(student_id, img, DB_PATH)
            save_image_if_registered(student_id, img)
            return jsonify({"message": "Student registered successfully!"}), 201
        else:
            return jsonify(error_msg), 500  # Return the actual backend error

    except Exception as e:
        print("❌ Error:", str(e))
        print(traceback.format_exc())  # Prints full error traceback
        return jsonify({"error": "Internal Server Error"}), 500
