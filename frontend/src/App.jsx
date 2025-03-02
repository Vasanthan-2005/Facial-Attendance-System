import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/mainPage";
import StudentRegistration from "./pages/studentRegistration";
import AttendancePage from "./pages/studentAttendance";
import AdminLogin from "./pages/adminLogin";
import AdminDashboard from "./pages/adminDashboard/adminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/register" element={<StudentRegistration />} />
        <Route path="/attendance" element={<AttendancePage/>} />
        <Route path="/adminLogin" element={<AdminLogin/>} />
        <Route path="/admindashboard" element={<AdminDashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
