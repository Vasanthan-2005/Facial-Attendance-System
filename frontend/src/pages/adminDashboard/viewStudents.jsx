import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const apiUrl1 = import.meta.env.VITE_PORT5;
const apiUrl2 = import.meta.env.VITE_PORT8;

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Unauthorized! Please log in.");
          navigate("/adminLogin");
          return;
        }

        const response = await axios.get(`${apiUrl1}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students", error);

        if (error.response && error.response.status === 401) {
          alert("Session expired. Please log in again.");
          navigate("/adminLogin");
        } else {
          alert("Failed to fetch students.");
        }
      }
    };

    fetchStudents();
  }, [navigate]);

  return (
    <div className="container mx-auto p-6 text-white min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6">STUDENT LIST</h2>
      {students.length === 0 ? (
        <p className="text-xl text-gray-400 text-center">No students found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-700">
          <table className="min-w-full bg-gray-800 text-white border border-gray-600">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="py-3 px-6 text-center border border-gray-500">ID</th>
                <th className="py-3 px-6 text-center border border-gray-500">Name</th>
                <th className="py-3 px-6 text-center border border-gray-500">Image</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.student_id} className="border-b border-gray-500 hover:bg-gray-700">
                  <td className="py-4 px-6 text-center border border-gray-500">{student.student_id}</td>
                  <td className="py-4 px-6 text-center border border-gray-500">{student.name}</td>
                  <td className="py-4 px-6 flex justify-center border border-gray-500">
                    <img
                      src={`${apiUrl2}/photos/uploads/${student.student_id}.jpg`}
                      alt="Student"
                      className="w-60 h-60 object-cover rounded-lg shadow-md border border-gray-400"
                      onError={(e) => (e.target.src = `${apiUrl2}/uploads/notfound.jpg`)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewStudents;
