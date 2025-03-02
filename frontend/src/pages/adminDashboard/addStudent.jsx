import { useState, useRef } from "react";
import Webcam from "react-webcam";

const apiUrl = import.meta.env.VITE_PORT8;

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    email: "",
    department: "",
    parent_no: "",
  });
  const [errors, setErrors] = useState({});
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    success: false,
    studentData: null,
  });

  const resetForm = () => {
    setFormData({
      student_id: "",
      name: "",
      email: "",
      department: "",
      parent_no: "",
    });
    setCapturedImage(null);
    setWebcamOpen(false);
    setErrors({});
  };

  const webcamRef = useRef(null);

  const validate = (field, value) => {
    let tempErrors = { ...errors };

    if (
      field === "email" &&
      value &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
    ) {
      tempErrors.email = "Invalid email format";
    } else {
      delete tempErrors.email;
    }

    if (field === "parent_no" && value && !/^\d{10}$/.test(value)) {
      tempErrors.parent_no = "Invalid phone number (10 digits required)";
    } else {
      delete tempErrors.parent_no;
    }

    setErrors(tempErrors);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name.replace(/([A-Z])/g, " $1")} is required`,
      }));
    } else {
      validate(name, value);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      validate(name, value);
    }
    setErrors({
      ...errors,
      [name]: undefined,
    });
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};
    let allValid = true;
    Object.keys(formData).forEach((field) => {
      if (!formData[field]) {
        tempErrors[field] = "This field is required";
        allValid = false;
      }
    });
    if (!capturedImage) {
      tempErrors.faceId = "Face ID is required";
      allValid = false;
    }
    setErrors(tempErrors);
    if (!allValid) return;

    const requestData = {
      ...formData,
      face_image: capturedImage,
    };
    console.log("📤 Submitting Data:", formData);
    console.log("📤 Submitting Data:", capturedImage);

    try {
      const response = await fetch(`${apiUrl}/register/register_student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        setModal({
          isOpen: true,
          message: "✅ Student registered successfully!",
          success: true,
          studentData: requestData,
        });
      } else if (response.status === 409) {
        setModal({
          isOpen: true,
          message: "⚠️ Student already registered!",
          success: false,
          studentData: null,
        });
      } else {
        setModal({
          isOpen: true,
          message: "⚠️ Error: " + result.error,
          success: false,
          studentData: null,
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        message: "❌ Failed to register student. Please try again.",
        success: false,
        studentData: null,
      });
    }
  };

  return (
    <div className="min-h from-gray-900 to-black text-white flex items-center justify-center">
      <div className="absolute top-4 right-4 flex space-x-4"></div>
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Student Registration
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="student_id"
            placeholder="Student ID"
            value={formData.student_id}
            className={`w-full p-2 mb-2 bg-gray-700 rounded ${
              errors.student_id ? "border-red-500" : ""
            }`}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.student_id && (
            <p className="text-red-500 text-sm mb-2">{errors.student_id}</p>
          )}

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            className={`w-full p-2 mb-2 bg-gray-700 rounded ${
              errors.name ? "border-red-500" : ""
            }`}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mb-2">{errors.name}</p>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            className={`w-full p-2 mb-2 bg-gray-700 rounded ${
              errors.email ? "border-red-500" : ""
            }`}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mb-2">{errors.email}</p>
          )}

          <select
            name="department"
            className={`w-full p-2 mb-2 bg-gray-700 rounded ${
              errors.department ? "border-red-500" : ""
            }`}
            value={formData.department}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="AIDS">AIDS</option>
            <option value="AIML">CSE-AIML</option>
            <option value="CS">CSE-CS</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="ME">Mech</option>
          </select>
          {errors.department && (
            <p className="text-red-500 text-sm mb-2">{errors.department}</p>
          )}

          <input
            type="text"
            name="parent_no"
            placeholder="Parent No"
            value={formData.parent_no}
            className={`w-full p-2 mb-2 bg-gray-700 rounded ${
              errors.parent_no ? "border-red-500" : ""
            }`}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.parent_no && (
            <p className="text-red-500 text-sm mb-2">{errors.parent_no}</p>
          )}

          <div className="flex justify-between items-center mt-4">
            <p>Face ID</p>
            <button
              type="button"
              className={`px-4 py-2 rounded transition-transform transform ${
                webcamOpen ? "bg-red-500 scale-110" : "bg-teal-500 scale-100"
              }`}
              onClick={() => {
                setWebcamOpen(!webcamOpen);
                setCapturedImage(null);
              }}
            >
              {webcamOpen ? "Close Webcam" : "Open Webcam"}
            </button>
          </div>
          {errors.faceId && (
            <p className="text-red-500 text-sm mb-2">{errors.faceId}</p>
          )}

          <button
            type="submit"
            className="w-full mt-4 bg-emerald-500 py-2 rounded"
          >
            Register
          </button>
        </form>
      </div>
      <div
        className={`ml-6 p-4 bg-gray-800 rounded-xl shadow-lg w-[30rem] transition-opacity ${
          webcamOpen ? "opacity-100 animate-fade-in" : "opacity-0 hidden"
        } flex flex-col items-center`}
      >
        {webcamOpen && !capturedImage && (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded w-full h-auto"
          />
        )}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="rounded w-full h-auto"
          />
        )}
        <div className="flex justify-between mt-2 w-full">
          {webcamOpen && !capturedImage && (
            <button
              className="bg-blue-500 px-4 py-2 rounded w-full"
              onClick={handleCapture}
            >
              Capture Image
            </button>
          )}
          {capturedImage && (
            <button
              className="bg-yellow-500 px-4 py-2 rounded w-full"
              onClick={() => setCapturedImage(null)}
            >
              Retake
            </button>
          )}
        </div>
      </div>
      {modal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="relative bg-gray-800 p-6 rounded-xl shadow-lg w-96 text-center border border-gray-600">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-white text-xl font-bold 
             hover:text-red-500 transition-transform transform hover:scale-110"
              onClick={() => {
                setModal({ isOpen: false });
                if (modal.success) resetForm();
              }}
            >
              ❌
            </button>

            {/* Modal Content */}
            <p
              className={`text-lg font-bold mb-4 ${
                modal.success ? "text-green-400" : "text-red-400"
              }`}
            >
              {modal.message}
            </p>

            {modal.success && modal.studentData && (
              <div className="text-center">
                <p>
                  <strong>Student ID:</strong> {modal.studentData.student_id}
                </p>
                <p>
                  <strong>Name:</strong> {modal.studentData.name}
                </p>
                <p>
                  <strong>Email:</strong> {modal.studentData.email}
                </p>
                <p>
                  <strong>Department:</strong> {modal.studentData.department}
                </p>
                <p>
                  <strong>Parent No:</strong> {modal.studentData.parent_no}
                </p>
                {modal.studentData.face_image && (
                  <img
                    src={modal.studentData.face_image}
                    alt="Captured Face"
                    className="mt-4 rounded w-full"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRegistration;
