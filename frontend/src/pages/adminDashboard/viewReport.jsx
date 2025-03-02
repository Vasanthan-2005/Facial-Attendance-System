import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiUrl = import.meta.env.VITE_PORT5;

const ViewReports = () => {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);

  const fetchReport = async () => {
    if (!studentId.trim()) {
      toast.warn("Please enter a student ID!");
      return;
    }

    setLoading(true);
    setReports(null);
    setStudentName("");

    try {
      const response = await axios.get(
        `${apiUrl}/api/operations/reports/${studentId}`
      );

      if (response.data.reports && response.data.reports.length > 0) {
        setStudentName(response.data.student_name);
        setReports(response.data.reports);
      } else {
        toast.info("No attendance records found for this student.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch reports.");
    } finally {
      setLoading(false);
    }
  };

  const sendReports = async () => {
    if (!studentId.trim()) {
      toast.warn("Please fetch a student report first!");
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(
        `${apiUrl}/api/whatsapp/send-report/${studentId}`
      );
      toast.success(response.data.message, {
        style: { minWidth: "350px", maxWidth: "500px" },
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to send report.", {
        style: { minWidth: "350px", maxWidth: "500px" },
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setSending(false);
    }
  };

  const sendReportsToAll = async () => {
    setSendingAll(true);
    try {
      const response = await axios.post(`${apiUrl}/api/whatsapp/send-reports`);
      toast.success(response.data.message, {
        style: { minWidth: "350px", maxWidth: "500px" },
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to send reports to all students.", {
        style: { minWidth: "350px", maxWidth: "500px" },
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setSendingAll(false);
    }
  };

  return (
    <div className="p-6 relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">📊 View Attendance Reports</h2>
        <button
          onClick={sendReportsToAll}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
          disabled={sendingAll}
        >
          {sendingAll ? "Sending to All..." : "Send Reports to All"}
        </button>
      </div>

      {/* Input Field */}
      <input
        type="text"
        placeholder="Enter Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="border border-gray-400 rounded-md p-2 w-full"
      />

      {/* Buttons */}
      <div className="mt-3 flex gap-3">
        <button
          onClick={fetchReport}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
        >
          Fetch Report
        </button>

        <button
          onClick={sendReports}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
          disabled={sending}
        >
          {sending ? "Sending..." : "Send Report"}
        </button>
      </div>

      {/* Show Loading */}
      {loading && <p className="text-gray-500 mt-4">Fetching report...</p>}

      {/* Display Report */}
      {reports && (
        <div className="mt-6 p-4 border border-gray-500 rounded-lg bg-gray-800 text-white">
          <h3 className="text-xl font-semibold mb-2">Attendance Report</h3>

          {/* Scrollable Container */}
          <div className="max-h-80 overflow-y-auto">
            {reports.map((report, index) => (
              <div
                key={index}
                className="mb-4 p-3 border border-gray-600 rounded-md"
              >
                <p>
                  <strong>👤 Student Name:</strong> {studentName}
                </p>
                <p>
                  <strong>📅 Month:</strong> {report.month}
                </p>
                <p>
                  <strong>✅ Present Days:</strong> {report.present_days}
                </p>
                <p>
                  <strong>📆 Total Days:</strong> {report.total_days}
                </p>
                <p>
                  <strong>📊 Attendance %:</strong>{" "}
                  {report.attendance_percentage}
                </p>
                <p>
                  <strong>📞 Parent Contact:</strong> {report.parent_no}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReports;
