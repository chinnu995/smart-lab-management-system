import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Signup from './pages/Signup.jsx';
import Layout from './components/Layout.jsx';

// Student
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentAttendance from './pages/student/Attendance.jsx';
import StudentBookings from './pages/student/Bookings.jsx';
import StudentComplaints from './pages/student/Complaints.jsx';
import StudentAnnouncements from './pages/Announcements.jsx';
import Chatbot from './pages/Chatbot.jsx';

// Faculty
import FacultyDashboard from './pages/faculty/Dashboard.jsx';
import FacultyAttendance from './pages/faculty/MarkAttendance.jsx';
import FacultyBookings from './pages/faculty/Bookings.jsx';
import FacultyComplaints from './pages/faculty/Complaints.jsx';
import FacultyAnnouncements from './pages/faculty/Announcements.jsx';

// HOD
import HodDashboard from './pages/hod/Dashboard.jsx';
import ManageStudents from './pages/hod/Students.jsx';
import ManageFaculty from './pages/hod/Faculty.jsx';
import ManageLabs from './pages/hod/Labs.jsx';
import ManageEquipment from './pages/hod/Equipment.jsx';
import Analytics from './pages/hod/Analytics.jsx';
import AuditLogs from './pages/hod/AuditLogs.jsx';
import HodTests from './pages/hod/Tests.jsx';
import StudentTests from './pages/student/ActiveTests.jsx';
import TakeTest from './pages/student/TakeTest.jsx';

function Private({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
  return <Navigate to="/hod" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Private><Layout/></Private>}>
        <Route index element={<RoleHome />} />
        <Route path="announcements" element={<StudentAnnouncements />} />
        <Route path="chatbot" element={<Chatbot />} />

        {/* Student */}
        <Route path="student" element={<Private roles={['student']}><StudentDashboard/></Private>} />
        <Route path="student/attendance" element={<Private roles={['student']}><StudentAttendance/></Private>} />
        <Route path="student/bookings" element={<Private roles={['student']}><StudentBookings/></Private>} />
        <Route path="student/complaints" element={<Private roles={['student']}><StudentComplaints/></Private>} />
        <Route path="student/tests" element={<Private roles={['student']}><StudentTests/></Private>} />
        <Route path="student/test/:testId" element={<Private roles={['student']}><TakeTest/></Private>} />

        {/* Faculty */}
        <Route path="faculty" element={<Private roles={['faculty']}><FacultyDashboard/></Private>} />
        <Route path="faculty/attendance" element={<Private roles={['faculty']}><FacultyAttendance/></Private>} />
        <Route path="faculty/bookings"   element={<Private roles={['faculty']}><FacultyBookings/></Private>} />
        <Route path="faculty/complaints" element={<Private roles={['faculty']}><FacultyComplaints/></Private>} />
        <Route path="faculty/announcements" element={<Private roles={['faculty']}><FacultyAnnouncements/></Private>} />
        <Route path="faculty/tests" element={<Private roles={['faculty']}><HodTests/></Private>} />

        {/* HOD */}
        <Route path="hod" element={<Private roles={['hod']}><HodDashboard/></Private>} />
        <Route path="hod/students" element={<Private roles={['hod']}><ManageStudents/></Private>} />
        <Route path="hod/faculty"  element={<Private roles={['hod']}><ManageFaculty/></Private>} />
        <Route path="hod/labs"     element={<Private roles={['hod']}><ManageLabs/></Private>} />
        <Route path="hod/equipment" element={<Private roles={['hod']}><ManageEquipment/></Private>} />
        <Route path="hod/complaints" element={<Private roles={['hod']}><FacultyComplaints/></Private>} />
        <Route path="hod/analytics" element={<Private roles={['hod']}><Analytics/></Private>} />
        <Route path="hod/tests"     element={<Private roles={['hod']}><HodTests/></Private>} />
        <Route path="hod/audit"     element={<Private roles={['hod']}><AuditLogs/></Private>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
