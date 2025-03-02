import React, { useState, useEffect } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_PORT5;

const Home = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentStudents, setPresentStudents] = useState(0);
  const [absentStudents, setAbsentStudents] = useState(0);
  const [totalWorkingDays, setTotalWorkingDays] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get auth token from localStorage (or wherever it's stored)
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No auth token found!");
          return;
        }

        // Set headers with the token
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch college status with auth token
        const resCollegeStatus = await axios.get(
          `${apiUrl}/api/admin/status`,
          config
        );
        console.log("College Status Response:", resCollegeStatus.data); // Debugging log

        const isCollegeOn = resCollegeStatus.data?.status?.toUpperCase() === "ON";

        // Fetch all required data with auth token
        const resTotalStudents = await axios.get(
          `${apiUrl}/api/operations/total`,
          config
        );
        const resPresentStudents = await axios.get(
          `${apiUrl}/api/operations/present`,
          config
        );
        const resTotalWorkingDays = await axios.get(
          `${apiUrl}/api/operations/workingdays`,
          config
        );

        let absentCount = 0;
        if (isCollegeOn) {
          const resAbsentStudents = await axios.get(
            `${apiUrl}/api/operations/absent`,
            config
          );
          absentCount = resAbsentStudents.data.absent_students || 0;
        }

        // Set state variables
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
    <div className="text-center flex-1 flex flex-col justify-center items-center">
      <h2 className="text-8xl font-bold mb-6 mt-20">WELCOME ADMIN</h2>
      <p className="mt-8 text-2xl">👨‍🎓 Total Students: {totalStudents}</p>
      <p className="mt-2 text-2xl">✅ Present Students: {presentStudents}</p>
      <p className="mt-2 text-2xl">❌ Absent Students: {absentStudents}</p>
      <p className="mt-2 text-2xl">📅 Total Working Days: {totalWorkingDays}</p>
    </div>
  );
};

export default Home;
