import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

// Shared Components
// Paths are relative to the App.jsx file itself, assuming it's in the 'src' directory.
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { SocketProvider } from "./contexts/SocketContext.jsx";

// Utility Pages
import Landing from "./pages/utils/Landing.jsx";

// Auth Pages
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import NotFound from "./pages/auth/NotFound.jsx";
import Unauthorized from "./pages/utils/Unauthorized.jsx";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentProfileForm from "./pages/student/StudentProfileForm.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";
import TeacherList from "./pages/student/TeacherList.jsx";
import BookClass from "./pages/student/BookClass.jsx";
import StudentMessages from "./pages/student/Messages.jsx";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import TeacherProfileForm from "./pages/teacher/TeacherProfileForm.jsx";
import TeacherProfile from "./pages/teacher/TeacherProfile.jsx";
// NEW: Import the TeacherProfileEdit component
import TeacherProfileEdit from "./pages/teacher/TeacherProfileEdit.jsx";
import TeacherScheduleForm from "./pages/teacher/TeacherScheduleForm.jsx";
import Bookings from "./pages/teacher/Bookings.jsx";
import TeacherMessages from "./pages/teacher/Messages.jsx";

// Define constants for roles (consistent across Login.jsx and ProtectedRoute.jsx)
const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
};

function App() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  
  // Get current user for socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
  }, []);

  // Define routes where navbar should NOT be shown
  const noNavbarRoutes = [
    '/login',
    '/signup',
    '/student/dashboard',
    '/teacher/dashboard',
    '/student/profile-setup',
    '/teacher/profile-setup',
    '/student/profile',
    '/teacher/profile',
    // NEW: Add the edit profile route to the list
    '/teacher/profile/edit',
    '/student/find-teachers',
    '/student/book-class',
    '/student/messages',
    '/teacher/schedule',
    '/teacher/bookings',
    '/teacher/messages'
  ];

  // Check if current route should show navbar
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <SocketProvider userId={currentUser?._id}>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Student Routes */}
        {/* Student Profile Setup: Requires student role, profile MUST NOT be complete yet */}
        <Route
          path="/student/profile-setup"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} profileCompleteRequired={false}>
              <StudentProfileForm />
            </ProtectedRoute>
          }
        />
        {/* Student Dashboard: Requires student role, profile MUST be complete */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} profileCompleteRequired={true}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        {/* Other Student Protected Routes: Require student role, profile MUST be complete */}
        <Route
          path="/student/find-teachers"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} profileCompleteRequired={true}>
              <TeacherList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/book-class"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} profileCompleteRequired={true}>
              <BookClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/messages"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} profileCompleteRequired={true}>
              <StudentMessages />
            </ProtectedRoute>
          }
        />
        {/* Student Profile View: Redirect to profile setup */}
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} profileCompleteRequired={true}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        {/* Teacher Profile Setup: Requires teacher role, profile can be incomplete or complete */}
        <Route
          path="/teacher/profile-setup"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]} profileCompleteRequired={null}>
              <TeacherProfileForm />
            </ProtectedRoute>
          }
        />
        {/* Teacher Dashboard: Requires teacher role, profile MUST be complete */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]} profileCompleteRequired={true}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        {/* Other Teacher Protected Routes: Require teacher role, profile MUST be complete */}
        <Route
          path="/teacher/schedule"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]} profileCompleteRequired={true}>
              <TeacherScheduleForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/bookings"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]} profileCompleteRequired={true}>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/messages"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]} profileCompleteRequired={true}>
              <TeacherMessages />
            </ProtectedRoute>
          }
        />
        {/* Teacher Profile View: Redirect to profile setup */}
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]} profileCompleteRequired={true}>
              <TeacherProfile />
            </ProtectedRoute>
          }
        />
        {/* NEW: Teacher Profile Edit Route */}
        <Route
          path="/teacher/profile/edit"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]} profileCompleteRequired={true}>
              <TeacherProfileEdit />
            </ProtectedRoute>
          }
        />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;
