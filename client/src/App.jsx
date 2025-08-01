import { Routes, Route } from "react-router-dom";

// Shared Components
// Paths are relative to the App.jsx file itself, assuming it's in the 'src' directory.
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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
import TeacherList from "./pages/student/TeacherList.jsx";
import BookClass from "./pages/student/BookClass.jsx";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import TeacherProfileForm from "./pages/teacher/TeacherProfileForm.jsx";
import TeacherScheduleForm from "./pages/teacher/TeacherScheduleForm.jsx";
import Bookings from "./pages/teacher/Bookings.jsx";

// Define constants for roles (consistent across Login.jsx and ProtectedRoute.jsx)
const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
};

function App() {
  return (
    <>
      <Navbar />
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

        {/* Teacher Routes */}
        {/* Teacher Profile Setup: Requires teacher role, profile MUST NOT be complete yet */}
        <Route
          path="/teacher/profile-setup"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]} profileCompleteRequired={false}>
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

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
