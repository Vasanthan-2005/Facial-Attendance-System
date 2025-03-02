import os
from flask import Blueprint, send_from_directory

photos_bp = Blueprint("photos", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

@photos_bp.route("/uploads/<filename>")
def get_image(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        return send_from_directory(UPLOAD_FOLDER, filename)
    else:
        return "File Not Found", 404