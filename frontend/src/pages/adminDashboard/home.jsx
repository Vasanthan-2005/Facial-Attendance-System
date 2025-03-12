import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const apiUrl = import.meta.env.VITE_PORT5;

const Home = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentStudents, setPresentStudents] = useState(0);
  const [absentStudents, setAbsentStudents] = useState(0);
  const [totalWorkingDays, setTotalWorkingDays] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found!");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const resCollegeStatus = await axios.get(`${apiUrl}/api/admin/status`, config);
        const isCollegeOn = resCollegeStatus.data?.status?.toUpperCase() === "ON";

        const resTotalStudents = await axios.get(`${apiUrl}/api/operations/total`, config);
        const resPresentStudents = await axios.get(`${apiUrl}/api/operations/present`, config);
        const resTotalWorkingDays = await axios.get(`${apiUrl}/api/operations/workingdays`, config);

        let absentCount = 0;
        if (isCollegeOn) {
          const resAbsentStudents = await axios.get(`${apiUrl}/api/operations/absent`, config);
          absentCount = resAbsentStudents.data.absent_students || 0;
        }

        setTotalStudents(resTotalStudents.data.total_students || 0);
        setPresentStudents(resPresentStudents.data.present_students || 0);
        setAbsentStudents(absentCount);
        setTotalWorkingDays(resTotalWorkingDays.data.total_working_days || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen ">
      <motion.h1
        className="text-8xl font-extrabold mb-10 mt-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        WELCOME ADMIN
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-10">
        {[ 
          { label: "Total Students", value: totalStudents, icon: "👨‍🎓" },
          { label: "Total Working Days", value: totalWorkingDays, icon: "📅" },
          { label: "Present Today", value: presentStudents, icon: "✅" },
          { label: "Absent Today", value: absentStudents, icon: "❌" },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="p-6 bg-gray-800 rounded-2xl shadow-xl flex items-center space-x-4 border-l-8 border-green-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <span className="text-4xl">{item.icon}</span>
            <div>
              <p className="text-lg font-medium text-gray-400">{item.label}</p>
              <p className="text-3xl font-bold text-white">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;