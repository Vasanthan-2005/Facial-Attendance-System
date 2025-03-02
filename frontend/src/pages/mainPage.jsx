import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="text-center mb-16 mt-[-60px]">
        <h1 className="text-7xl md:text-5xl font-extrabold drop-shadow-lg text-gray-200 whitespace-nowrap tracking-wide">ATTENDANCE MANAGEMENT SYSTEM</h1>
        <p className="text-gray-400 text-xl mt-2 tracking-widest">(Under Testing)</p>
      </div>
      
      <div className="space-y-6 w-full max-w-xs">
        <button onClick={() => navigate('/register')} className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-teal-500 transition-all transform hover:scale-110">
          Student Registration
        </button>
        <button onClick={() => navigate('/attendance')} className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-emerald-500 transition-all transform hover:scale-110">
          Student Attendance
        </button>
        <button onClick={() => navigate('/adminLogin')} className="w-full px-6 py-3 bg-rose-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-rose-500 transition-all transform hover:scale-110">
          Admin Login
        </button>
      </div>
    </div>
  );
};

export default MainPage;
