import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import navigate

const apiUrl1 = import.meta.env.VITE_PORT5;
const apiUrl2 = import.meta.env.VITE_PORT8;

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        if (!token) {
          alert("Unauthorized! Please log in.");
          navigate("/adminLogin"); // Redirect to login page
          return;
        }

        const response = await axios.get(
          `${apiUrl1}/api/admin/students`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Fixed template literal
          }
        );

        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students", error);

        if (error.response && error.response.status === 401) {
          alert("Session expired. Please log in again.");
          navigate("/adminLogin"); // Redirect to login page
        } else {
          alert("Failed to fetch students.");
        }
      }
    };

    fetchStudents();
  }, [navigate]); // Added navigate to dependency array

  return (
    <div className="h-150 flex flex-col">
      <h2 className="text-3xl font-semibold">Student List</h2>
      {students.length === 0 ? (
        <p className="text-4xl text-gray-400 mt-20">No students found.</p>
      ):(
      <div className="flex-1 overflow-auto border border-gray-700 mt-4 h-[80vh]">
        <table className="w-full h-full border-collapse">
          <thead className="sticky top-0 bg-blue-700 text-white">
            <tr>
              <th className="border p-3">ID</th>
              <th className="border p-3">Name</th>
              <th className="border p-3">Image</th>
            </tr>
          </thead>
          <tbody className="h-full">
            {students.map((student) => (
              <tr
                key={student.student_id}
                className="text-center align-middle hover:bg-gray-700"
              >
                <td className="border p-3">{student.student_id}</td>
                <td className="border p-3">{student.name}</td>
                <td className="border p-3">
                  <div className="flex justify-center items-center p-1 rounded-lg">
                    <img
                      src={`${apiUrl2}/photos/uploads/${student.student_id}.jpg`} // Fixed backticks
                      alt="Student"
                      className="w-80 h-60 rounded-lg shadow-md"
                      onError={(e) =>
                        (e.target.src = "${apiUrl2}/uploads/notfound.jpg")
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) }
      
    </div>
  );
};

export default ViewStudents;
