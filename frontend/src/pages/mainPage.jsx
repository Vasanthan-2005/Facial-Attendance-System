import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 to-black text-white p-6 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-96 h-96 bg-teal-500 opacity-30 blur-3xl rounded-full top-10 left-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-rose-500 opacity-30 blur-3xl rounded-full bottom-10 right-10 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="text-center mb-16 mt-[-60px] z-10">
        <h1 className="text-6xl md:text-5xl font-extrabold drop-shadow-xl text-gray-100 tracking-wide uppercase">
          Attendance Management System
        </h1>
        <p className="text-gray-400 text-xl mt-2 tracking-widest">(Under Testing)</p>
      </div>
      
      {/* Buttons */}
      <div className="space-y-6 w-full max-w-xs z-10">
        <motion.button
          onClick={() => navigate('/register')}
          whileHover={{ scale: 1.1, boxShadow: "0px 0px 10px rgba(45, 212, 191, 0.8)" }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-teal-500 transition-all"
        >
          Student Registration
        </motion.button>

        <motion.button
          onClick={() => navigate('/attendance')}
          whileHover={{ scale: 1.1, boxShadow: "0px 0px 10px rgba(52, 205, 161, 0.8)" }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-emerald-500 transition-all"
        >
          Student Attendance
        </motion.button>

        <motion.button
          onClick={() => navigate('/adminLogin')}
          whileHover={{ scale: 1.1, boxShadow: "0px 0px 10px rgba(165, 29, 47, 0.8)" }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-6 py-3 bg-rose-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-rose-500 transition-all"
        >
          Admin Login
        </motion.button>
      </div>
    </div>
  );
};

export default MainPage;
