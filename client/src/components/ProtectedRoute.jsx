import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Import for loading spinner

// Define constants for roles to avoid magic strings
const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
};

const ProtectedRoute = ({ children, allowedRoles, profileCompleteRequired = false }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUser = () => {
      // Add a small delay to ensure localStorage has fully updated
      // This is a common workaround for potential timing issues with localStorage
      // updates from previous navigations/component unmounts.
      setTimeout(() => {
        try {
          const user = localStorage.getItem('currentUser');
          if (user) {
            setCurrentUser(JSON.parse(user));
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("ProtectedRoute: Failed to parse currentUser from localStorage or user is null:", error);
          setCurrentUser(null);
          // It's a good practice to clear potentially corrupted localStorage data
          localStorage.removeItem('currentUser');
        } finally {
          setLoading(false);
        }
      }, 50); // Small delay of 50ms
    };

    // Check user on component mount and whenever the URL pathname changes
    // This helps to re-evaluate the user's status after a navigation event
    checkUser();

    // Add event listener for 'storage' events to react to changes in other tabs/windows
    // Note: This listener fires when localStorage is modified in *another* browser tab/window,
    // not reliably within the same tab without specific custom events.
    window.addEventListener('storage', checkUser);

    // Cleanup function: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, [location.pathname]); // Re-run effect when pathname changes

  // Display a loading spinner while authentication and profile status are being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <div className="flex items-center space-x-3 text-violet-600 text-lg font-medium animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Authenticating...</span>
        </div>
      </div>
    );
  }

  // --- Redirection Logic ---

  // 1. If no current user is found, redirect to the login page.
  if (!currentUser) {
    console.log("ProtectedRoute: No current user found. Redirecting to /login.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If the user's role is not among the allowed roles for this route, redirect to unauthorized.
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    console.warn(`ProtectedRoute: Access denied for role '${currentUser.role}'. Required roles: ${allowedRoles.join(', ')}. Redirecting to unauthorized.`);
    // Attempt to redirect to their respective dashboard if role is just mismatched but valid
    if (currentUser.role === USER_ROLES.STUDENT) return <Navigate to="/student/dashboard" replace />;
    if (currentUser.role === USER_ROLES.TEACHER) return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />; // Fallback for genuinely unauthorized access
  }

  // 3. Check profile completion status based on route requirement.
  const currentProfileCompleteStatus = !!currentUser.profileComplete; // Ensure boolean value

  // Scenario A: Route requires profile to be COMPLETE (e.g., Dashboards)
  if (profileCompleteRequired) {
    if (!currentProfileCompleteStatus) {
      // User has the allowed role, but their profile is NOT complete as required by the route.
      console.log(`ProtectedRoute: Profile incomplete for ${currentUser.role}. Redirecting to profile setup.`);
      if (currentUser.role === USER_ROLES.STUDENT) {
        return <Navigate to="/student/profile-setup" replace />;
      }
      if (currentUser.role === USER_ROLES.TEACHER) {
        return <Navigate to="/teacher/profile-setup" replace />;
      }
    }
    // If profile IS complete and required, proceed to render children (the protected page).
  }
  // Scenario B: Route is a PROFILE SETUP page (profileCompleteRequired = false)
  else {
    if (currentProfileCompleteStatus) {
      // User has the allowed role, their profile IS complete, but they are trying to access a setup page.
      // Redirect them to their dashboard as their profile is already set up.
      console.log(`ProtectedRoute: Profile already complete for ${currentUser.role}. Redirecting to dashboard.`);
      if (currentUser.role === USER_ROLES.STUDENT) {
        return <Navigate to="/student/dashboard" replace />;
      }
      if (currentUser.role === USER_ROLES.TEACHER) {
        return <Navigate to="/teacher/dashboard" replace />;
      }
    }
    // If profile is NOT complete and it's a setup page, proceed to render children.
  }

  // If all authorization and profile completion checks pass, render the child components (the protected page).
  return children;
};

export default ProtectedRoute;
