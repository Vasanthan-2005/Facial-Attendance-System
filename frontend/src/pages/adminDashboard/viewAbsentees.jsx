import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiUrl = import.meta.env.VITE_PORT5;

const ViewAbsentees = () => {
  const [absentees, setAbsentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsAppConnected, setWhatsAppConnected] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [fetchingQR, setFetchingQR] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    fetchAbsentees();
    checkWhatsAppStatus();
  }, []);

  // Fetch absentees
  const fetchAbsentees = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized! Please log in.");
        return;
      }

      const response = await axios.get(`${apiUrl}/api/admin/absentees`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAbsentees(response.data || []);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setAbsentees([]); // Ensure absentees list is empty
      } else {
        toast.error("Failed to fetch absentees. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check WhatsApp connection status
  const checkWhatsAppStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/whatsapp/status`);
      setWhatsAppConnected(response.data.isConnected);
      return response.data.isConnected;
    } catch (error) {
      toast.error("Error checking WhatsApp status.");
      setWhatsAppConnected(false);
      return false;
    }
  };

  // Poll WhatsApp status every 3 seconds while QR modal is open
  useEffect(() => {
    if (showQRModal) {
      console.log("Starting WhatsApp status polling...");
      const interval = setInterval(async () => {
        const isConnected = await checkWhatsAppStatus();
        if (isConnected) {
          console.log(
            "WhatsApp Connected ✅ - Showing message before closing..."
          );

          // Show "Connected" message for 2 seconds before closing the modal
          setTimeout(() => {
            setShowQRModal(false);
            setQrCode(null);
          }, 2000);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [showQRModal]);

  // Fetch WhatsApp QR code
  const fetchWhatsAppQR = async () => {
    setFetchingQR(true);
    setQrCode(null);
    setShowQRModal(true);
    try {
      const response = await axios.get(`${apiUrl}/api/whatsapp/get-qr`);
      setQrCode(response.data.qr);
    } catch (error) {
      toast.error("Failed to fetch QR code. Try again.");
    } finally {
      setFetchingQR(false);
    }
  };

  // Handle Send Notifications
  const handleSendNotifications = async () => {
    if (!whatsAppConnected) {
      toast.warn("WhatsApp is not connected! Scan the QR Code.");
      fetchWhatsAppQR();
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/whatsapp/send-absentees`
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Failed to send absentee messages.");
    }
  };

  return (
    <div className="p-6">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Send Notifications Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold">🚫 ABSENTEES LIST</h2>
        <button
          onClick={handleSendNotifications}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300hover:from-orange-500 hover:to-red-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all duration-300"
        >
          Send Notifications
        </button>
      </div>

      {/* Absentees List */}
      {loading ? (
        <p className="text-center text-gray-400 text-2xl font-semibold mt-6">
          Loading...
        </p>
      ) : absentees.length === 0 ? (
        <p className="text-center text-4xl font-bold text-green-400 mt-10">
          ✅ No Absentees Today!
        </p>
      ) : (
        <table className="w-full border-collapse border border-gray-700 text-white">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-700 px-4 py-2 text-lg">
                Student ID
              </th>
              <th className="border border-gray-700 px-4 py-2 text-lg">Name</th>
            </tr>
          </thead>
          <tbody>
            {absentees.map((student) => (
              <tr
                key={student.student_id}
                className="text-center bg-gray-800 hover:bg-gray-700"
              >
                <td className="border border-gray-700 px-4 py-3 text-lg">
                  {student.student_id}
                </td>
                <td className="border border-gray-700 px-4 py-3 text-lg">
                  {student.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* WhatsApp QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-xl font-bold mb-4">
              {whatsAppConnected
                ? "WhatsApp is Connected✅"
                : "Scan QR to Connect"}
            </h2>

            {whatsAppConnected ? (
              <div className="flex flex-col items-center">
                <span className="text-green-500 text-6xl"></span>
                <p className="text-green-500 font-bold mt-2">
                  WhatsApp Connected!
                </p>
              </div>
            ) : fetchingQR ? (
              <p className="text-blue-500">Fetching QR Code...</p>
            ) : qrCode ? (
              <img
                src={qrCode}
                alt="WhatsApp QR Code"
                className="mx-auto mb-4 border border-gray-300 rounded-lg shadow-md"
              />
            ) : (
              <p className="text-red-500">QR Code not available. Try again.</p>
            )}

            <button
              onClick={() => {
                setShowQRModal(false);
                checkWhatsAppStatus();
              }}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAbsentees;
