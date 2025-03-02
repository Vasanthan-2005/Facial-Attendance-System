import React, { useState } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";

const apiUrl = import.meta.env.VITE_PORT5;

const DeleteStudent = () => {
  const [studentId, setStudentId] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchStudentDetails = async () => {
    try {
      setError("");
      console.log("Fetching details for ID:", studentId);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication error. Please login again.");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        `${apiUrl}/api/admin/students/${studentId}`,
        config
      );

      if (res.data) {
        setStudentData(res.data);
        setIsModalOpen(true);
      } else {
        setError("Student not found.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    }
  };

  const deleteStudent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication error. Please login again.");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(
        `${apiUrl}/api/admin/students/${studentId}`,
        config
      );

      setDeleteSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setDeleteSuccess(false);
        setStudentData(null);
        setStudentId("");
      }, 1000);
    } catch (err) {
      setError("Error deleting student.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Delete Student Box */}
      <div className="bg-gray-900 text-white p-8 rounded-2xl shadow-lg border border-gray-700 w-96 text-center mb-100">
        <h1 className="text-2xl font-bold mb-6 text-red-400">
          🚨 Delete Student
        </h1>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="p-2 bg-gray-800 rounded-md border border-gray-600 mb-4 w-full text-center"
        />

        {/* Fetch Details Button */}
        <button
          onClick={fetchStudentDetails}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold transition-all duration-300 w-full"
        >
          Fetch Details
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-96 text-center border border-gray-700 relative">
            {!deleteSuccess ? (
              <>
                {/* Confirmation Message */}
                <p className="text-lg font-bold mb-4 text-red-400">
                  ⚠ Are you sure you want to delete?
                </p>

                {/* Student Details */}
                {studentData && (
                  <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700 text-left">
                    <p>
                      <strong>🆔 ID:</strong> {studentData.student_id}
                    </p>
                    <p>
                      <strong>👤 Name:</strong> {studentData.name}
                    </p>
                    <p>
                      <strong>📧 Email:</strong> {studentData.email}
                    </p>
                    <p>
                      <strong>🏛 Department:</strong> {studentData.department}
                    </p>
                    <p>
                      <strong>📞 Parent No:</strong> {studentData.parent_no}
                    </p>
                    {studentData.face_image && (
                      <img
                        src={studentData.face_image}
                        alt="Captured Face"
                        className="mt-4 rounded-md w-full border border-gray-700"
                      />
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={deleteStudent}
                    className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold transition-all duration-300"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 hover:bg-gray-600 px-5 py-2 rounded-lg font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <FaCheckCircle className="text-green-500 text-5xl mb-4" />
                <p className="text-green-400 text-lg font-bold">
                  ✅ Student deleted successfully!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteStudent;
