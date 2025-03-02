import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "../styles/animations.css";

const COLLEGE_COORDINATES = { lat: 12.971355, lng: 80.043253 };
const RADIUS = 2000; // 200 meters

const apiUrl1 = import.meta.env.VITE_PORT5;
const apiUrl2 = import.meta.env.VITE_PORT8;

const AttendancePage = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const locationChecked = useRef(false); // ✅ Fix for duplicate calls

  const [collegeStatus, setCollegeStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webcamError, setWebcamError] = useState(false);
  const [borderClass, setBorderClass] = useState("border-gray-400");
  const [isWithinRange, setIsWithinRange] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl1}/api/attendance/status`)
      .then((res) => res.json())
      .then((data) => {
        setCollegeStatus(data.status);
        setIsLoading(false);

        if (data.status === "ON" && !locationChecked.current) {
          locationChecked.current = true; // ✅ Ensures location check runs only once
          getUserLocation();
        }
      })
      .catch((err) => {
        console.error("Error fetching college status:", err);
        setIsLoading(false);
      });
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("❌ Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(
          `📍 Location: ${latitude}, ${longitude} (Accuracy: ${accuracy} meters)`
        );

        const distance = (
          getDistance(
            latitude,
            longitude,
            COLLEGE_COORDINATES.lat,
            COLLEGE_COORDINATES.lng
          ) / 1000
        ).toFixed(2);

        console.log("Distance:", distance, "km");

        if (distance <= RADIUS) {
          // Convert meters to km for comparison
          setIsWithinRange(true);
          toast.success(`You are within range (Distance: ${distance} km).`, {
            autoClose: 3000,style:{minWidth:"380px"}
          });
        } else {
          setIsWithinRange(false);
          toast.error("You are outside the allowed attendance range.", {
            autoClose: 4000,
          });
        }
      },
      (error) => {
        console.error("Error fetching location:", error.message);
        toast.error("⚠️ Failed to fetch location. Enable GPS and try again.", {
          autoClose: 4000,
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  const resetPage = () => {
    setCapturedImage(null);
    setBorderClass("border-gray-400");
  };

  const captureImage = () => {
    if (!isWithinRange) {
      toast.error("You are not in the allowed location to mark attendance.", {
        autoClose: 4000,
      });
      return;
    }
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        sendImageToBackend(imageSrc);
      } else {
        toast.error("⚠️ Failed to capture image. Try again.", {
          autoClose: 4000,
        });
        setBorderClass("border-red-500 animate-glow-red");
      }
    }
  };

  const sendImageToBackend = (imageData) => {
    setIsProcessing(true);
    setBorderClass("border-gray-400");

    fetch(`${apiUrl2}/attendance/recognize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ image: imageData }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🔍 Full API Response:", data);

        if (Array.isArray(data)) {
          data = data[0];
        }

        if (data.success) {
          toast.success(`${data.message}`, { autoClose: 4000 });
          setBorderClass("border-green-500 animate-glow-green");
        } else {
          toast.error(`${data.message}`, {
            autoClose: 4000, // Keep the same duration
            style: { minWidth: "335px" }, // Increases the width of the toast box
          });
          setBorderClass("border-red-500 animate-glow-red");
        }

        setTimeout(resetPage, 4400);
      })
      .catch(() => {
        toast.error("Server error, try again.", { autoClose: 5000 });
        setBorderClass("border-red-500 animate-glow-red");
      })
      .finally(() => setIsProcessing(false));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <ToastContainer position="top-right" autoClose={4000} />

      {isLoading ? (
        <p className="text-xl text-gray-300">Checking college status...</p>
      ) : collegeStatus === "OFF" ? (
        <div className="p-6 border-2 border-gray-400 rounded-md shadow-md text-center bg-gray-800 text-gray-200">
          <p className="text-3xl font-bold">College is closed today.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6 mt-16">
          <div className="flex justify-between items-center w-full max-w-6xl">
            {/* Left Side Guidelines - Centered */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg shadow-md text-gray-200 text-center w-60">
                <ul className="text-sm space-y-1">
                  <li>✅ Ensure proper lighting.</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-md text-gray-200 text-center w-60">
                <ul className="text-sm space-y-1">
                  <li>✅ Face should be fully visible.</li>
                </ul>
              </div>
            </div>

            {/* Webcam - Slightly increased size with proper gap */}
            <div className="mx-10">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className={`rounded-md shadow-lg border-4 ${borderClass} w-[750px] h-[416px]`}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className={`rounded-md shadow-lg border-4 ${borderClass}`}
                    onUserMediaError={() => setWebcamError(true)}
                    style={{ width: "750px", height: "416px" }} // Slightly increased size
                  />
                </motion.div>
              )}
            </div>

            {/* Right Side Guidelines - Centered */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg shadow-md text-gray-200 text-center w-70">
                <ul className="text-sm space-y-1">
                  <li>✅ Avoid hats, sunglasses, and masks.</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-md text-gray-200 text-center w-70">
                <ul className="text-sm space-y-1">
                  <li>✅ Position your face in the center.</li>
                </ul>
              </div>
            </div>
          </div>

          {webcamError && (
            <p className="text-red-500">
              ⚠️ Webcam access denied. Please allow camera permissions.
            </p>
          )}
          <motion.button
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-emerald-500 transition-all transform hover:scale-110 disabled:opacity-50"
            onClick={captureImage}
            disabled={isProcessing || webcamError}
            whileTap={{ scale: 0.9 }}
          >
            {isProcessing ? "Processing..." : "Capture Attendance"}
          </motion.button>
        </div>
      )}

      <motion.div
        className="flex flex-col items-center justify-center h-auto bg-gradient-to-br from-gray-900 to-black text-white p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-4 right-4 flex gap-3">
          <motion.button
            className="p-2 px-4 bg-rose-600 text-white rounded-md shadow-md hover:bg-rose-500 transition"
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate("/adminLogin")}
          >
            Admin Login
          </motion.button>
          <motion.button
            className="p-2 px-4 bg-teal-600 text-white rounded-md shadow-md hover:bg-teal-500 transition"
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate("/register")}
          >
            Register
          </motion.button>
          <motion.button
            className="p-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 transition"
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate("/")}
          >
            🏠
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AttendancePage;
