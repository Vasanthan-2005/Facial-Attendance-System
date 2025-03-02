import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const apiUrl = import.meta.env.VITE_PORT5;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [glowColor, setGlowColor] = useState("transparent");
  const [loading, setLoading] = useState(false); // Added loading state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleBlur = (e) => {
    if (!e.target.value) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: `${e.target.name} is required`,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true); // Start loading
    setServerError("");

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", result.token);

      setGlowColor("rgba(12, 230, 157, 0.8)"); // Green glow
      setTimeout(() => {
        setGlowColor("transparent");
        navigate("/admindashboard");
      }, 1000);
    } catch (error) {
      setServerError(error.message);
      setGlowColor("rgba(243, 11, 11, 0.8)"); // Red glow
      setTimeout(() => setGlowColor("transparent"), 4000);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
      {/* Top right corner buttons */}
      <div className="absolute top-4 right-4 flex gap-3">
        <motion.button
          className="p-2 px-4 bg-rose-600 text-white rounded-md shadow-md hover:bg-rose-500 transition"
          whileHover={{ scale: 1.1 }}
          onClick={() => navigate("/attendance")}
        >
          Attendance
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

      {/* Admin Login Form */}
      <motion.div
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-96"
        style={{ boxShadow: `0px 0px 15px ${glowColor}` }}
        animate={{ boxShadow: glowColor !== "transparent" ? `0px 0px 20px ${glowColor}` : "none" }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">ADMIN LOGIN</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            className="w-full p-2 bg-gray-700 rounded"
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username}</p>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            className="w-full p-2 bg-gray-700 rounded"
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}

          {/* Server Error Message */}
          {serverError && (
            <div className="text-red-500 text-center font-semibold">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-500 py-2 rounded hover:bg-emerald-600 transition flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
