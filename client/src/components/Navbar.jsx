import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react'; // Import useEffect and useState

export default function Navbar() {
  const navigate = useNavigate();
  // State to store current user information
  const [currentUser, setCurrentUser] = useState(null);

  // Effect to load user from localStorage and keep track of changes
  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        setCurrentUser(storedUser);
      } catch (error) {
        console.error("Failed to parse currentUser from localStorage:", error);
        setCurrentUser(null); // Clear user if parsing fails
      }
    };

    // Initial check
    checkUser();

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', checkUser);

    // Clean up event listener
    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const userRole = currentUser?.role;
  const isProfileComplete = currentUser?.profileComplete;

  const handleLogout = () => {
    // Clear only user-related items from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('lastLoginTime');
    // Force a re-check of user status in Navbar (triggers the useEffect)
    setCurrentUser(null); 
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center z-30 relative"> {/* Added z-index to ensure Navbar is on top */}
      <Link to="/" className="text-2xl font-extrabold text-indigo-600 transition-colors duration-300 hover:text-indigo-800">MyCampus</Link> {/* Updated title and added hover */}

      <div className="space-x-4 text-base font-medium"> {/* Adjusted font size and weight */}
        {/* Conditional rendering based on user role and profile completion */}
        {userRole === 'student' && (
          <>
            <Link 
              to={isProfileComplete ? "/student/dashboard" : "/student/profile-setup"} 
              className="hover:text-indigo-600 transition-colors duration-200"
            >
              Dashboard
            </Link>
            {isProfileComplete && (
              <>
                <Link to="/student/find-teachers" className="hover:text-indigo-600 transition-colors duration-200">Find Teachers</Link>
                <Link to="/student/book-class" className="hover:text-indigo-600 transition-colors duration-200">Book Class</Link>
              </>
            )}
          </>
        )}

        {userRole === 'teacher' && (
          <>
            <Link 
              to={isProfileComplete ? "/teacher/dashboard" : "/teacher/profile-setup"} 
              className="hover:text-purple-600 transition-colors duration-200"
            >
              Dashboard
            </Link>
            {isProfileComplete && (
              <>
                <Link to="/teacher/schedule" className="hover:text-purple-600 transition-colors duration-200">Schedule</Link>
                <Link to="/teacher/bookings" className="hover:text-purple-600 transition-colors duration-200">Bookings</Link>
              </>
            )}
          </>
        )}

        {/* Links for unauthenticated users */}
        {!currentUser && (
          <>
            <Link 
              to="/login" 
              className="text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-all duration-200"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md"
            >
              Signup
            </Link>
          </>
        )}

        {/* Logout button for authenticated users */}
        {currentUser && (
          <button 
            onClick={handleLogout} 
            className="text-red-500 hover:text-red-700 transition-colors duration-200 ml-4 font-semibold"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
