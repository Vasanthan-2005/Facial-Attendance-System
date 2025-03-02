import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Home from "./home";
import ViewStudents from "./viewStudents";
import AddStudent from "./addStudent";
import DeleteStudent from "./deleteStudent";
import ViewAbsentees from "./viewAbsentees";
import ViewReports from "./viewReport";

const apiUrl = import.meta.env.VITE_PORT5;

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent back button navigation
    const handleBackButton = () => {
      navigate(1); // Prevent going back
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    // Lock scrolling
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("popstate", handleBackButton);

      // Restore scrolling when unmounted
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    };
  }, [navigate]);

  const [collegeStatus, setCollegeStatus] = useState("ON"); // Default ON
  const [page, setPage] = useState("home"); // Default to home
  const [username, setUsername] = useState("");

  // Fetch college status
  const fetchCollegeStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized! Please log in.");
        navigate("/adminLogin");
        return;
      }
      const response = await axios.get(
        `${apiUrl}/api/admin/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCollegeStatus(response.data.status);
      console.log("API Response:", response);
    } catch (error) {
      console.error("Error fetching college status:", error);
      alert("Failed to fetch college status");
    }
  };

  // Fetch username (assuming stored in localStorage after login)
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    fetchCollegeStatus();
  }, []);

  // Toggle college status and fetch updated status
  const toggleCollegeStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized! Please log in.");
        navigate("/adminLogin");
        return;
      }

      const newStatus = collegeStatus === "ON" ? "OFF" : "ON";
      await axios.put(
        `${apiUrl}/api/admin/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchCollegeStatus(); // Fetch updated status after toggling
    } catch (error) {
      alert("Failed to update college status");
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/adminLogin");
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-gray-900 p-6 shadow-lg flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <nav className="w-full space-y-4">
          {[
            "home",
            "students",
            "add-student",
            "delete-student",
            "absentees",
            "reports",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setPage(item)}
              className={`w-full py-3 rounded-lg ${
                page === item ? "bg-blue-600" : "bg-gray-700 hover:bg-blue-600"
              }`}
            >
              {item === "home"
                ? "🏠 Home"
                : item === "students"
                ? "📚 View Students"
                : item === "add-student"
                ? "➕ Add Student"
                : item === "delete-student"
                ? "➖ Delete Student"
                : item === "absentees"
                ? "🚫 View Absentees"
                : "📊 View Reports"}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          {/* College Status Toggle */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">College Status:</h2>
            <span className="font-medium">
              {collegeStatus === "ON" ? "🟢 ON" : "🔴 OFF"}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={collegeStatus === "ON"}
                onChange={toggleCollegeStatus}
              />
              <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-green-500 peer-focus:outline-none after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-7"></div>
            </label>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-600 px-6 py-3 rounded-lg shadow-md text-white font-semibold hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Page Content */}
        {page === "home" && <Home username={username} />}
        {page === "students" && <ViewStudents />}
        {page === "add-student" && <AddStudent />}
        {page === "delete-student" && <DeleteStudent />}
        {page === "absentees" && <ViewAbsentees />}
        {page === "reports" && <ViewReports />}
      </div>
    </div>
  );
};

export default AdminDashboard;
