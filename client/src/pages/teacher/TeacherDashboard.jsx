import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CalendarDays, Users, DollarSign, LogOut, UserRound, ArrowRight, CheckCircle,
  Wallet, ListChecks, LayoutDashboard, Settings, Loader2, Info, XCircle, Bell, MessageSquare, Award, MonitorCheck
} from 'lucide-react';

// Import your storage utility functions
import { getFromLocalStorage, setToLocalStorage } from "../utils/storage";

// --- Constants ---
const LISTING_FEE = 100; // Define listing fee as a constant for easy updates.

// --- Mock Data Seeding (for demonstration) ---
// In a real application, this data would come from a backend API.
const seedTeacherDashboardData = () => {
  // Ensure 'currentUser' exists for a teacher
  const existingUser = getFromLocalStorage('currentUser');
  if (!existingUser) {
    setToLocalStorage('currentUser', {
      id: 101,
      _id: 101,
      firstName: 'Anya',
      lastName: 'Sharma',
      email: 'anya.sharma@example.com',
      role: 'teacher',
      profileComplete: true, // Set to true for initial testing of listed status
      teacherProfileData: {
        isListed: false, // Initial state for listing
        listedAt: null,
        phone: '+919876543210',
        location: 'Bengaluru, Karnataka',
        qualifications: 'M.Sc. Physics',
        experienceYears: 7,
        currentOccupation: 'Full-time Teacher',
        subjectsTaught: [{ id: 1, text: 'Physics' }, { id: 2, text: 'Mathematics' }],
        boardsTaught: [{ id: 1, text: 'CBSE' }, { id: 2, text: 'ICSE' }],
        classesTaught: [{ id: 1, text: 'Class 11' }, { id: 2, text: 'Class 12' }, { id: 3, text: 'JEE Mains' }],
        teachingMode: 'hybrid',
        preferredSchedule: 'Weekdays evenings, Weekends',
        bio: 'Passionate physics and mathematics educator with 7 years of experience. I believe in making learning fun and intuitive.',
        teachingApproach: 'Interactive sessions with real-world examples and problem-solving focus.',
        achievements: [{ id: 1, text: 'Mentored 100+ students to crack JEE' }],
        hourlyRate: 800,
        photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg'
      }
    });
  } else if (existingUser && existingUser.role === 'teacher' && !existingUser.id && !existingUser._id) {
    // Add ID if missing
    const updatedUser = { ...existingUser, id: 101, _id: 101 };
    setToLocalStorage('currentUser', updatedUser);
  }

  // Ensure 'registeredUsers' is also consistent with 'currentUser'
  let registeredUsers = getFromLocalStorage('registeredUsers', []);
  const currentTeacher = getFromLocalStorage('currentUser');
  if (currentTeacher && currentTeacher.role === 'teacher' && !registeredUsers.some(u => u.id === currentTeacher.id)) {
    registeredUsers.push(currentTeacher);
    setToLocalStorage('registeredUsers', registeredUsers);
  } else if (currentTeacher && currentTeacher.role === 'teacher') {
    // Update existing teacher in registeredUsers if currentUser changed
    registeredUsers = registeredUsers.map(user =>
      user.id === currentTeacher.id ? currentTeacher : user
    );
    setToLocalStorage('registeredUsers', registeredUsers);
  }

  // Mock bookings and inquiries removed - will be fetched from backend
  // TODO: Implement actual API endpoints for bookings and inquiries
  if (!getFromLocalStorage('teacherBookings')) {
    setToLocalStorage('teacherBookings', []); // Empty array instead of mock data
  }

  if (!getFromLocalStorage('teacherInquiries')) {
    setToLocalStorage('teacherInquiries', []); // Empty array instead of mock data
  }
};
// --- End Mock Data Seeding ---

/**
 * A reusable card component for the dashboard grid with futuristic styling.
 * @param {{ icon: React.ElementType, title: string, children: React.ReactNode, className?: string }} props
 */
const DashboardCard = ({ icon: Icon, title, children, className = '' }) => (
  <div className={`relative bg-white/90 shadow-lg p-6 rounded-2xl border border-gray-200 overflow-hidden
    transform hover:scale-[1.02] transition-all duration-300 hover:shadow-purple-400/40 ${className}`}>
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className="w-8 h-8 text-purple-600" />}
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      </div>
      <div className="flex-grow flex flex-col justify-center">
        {children}
      </div>
    </div>
  </div>
);

/**
 * A component to display a single statistic row with futuristic styling.
 * @param {{ label: string, value: string | number, valueClassName?: string }} props
 */
const StatRow = ({ label, value, valueClassName = 'text-purple-700' }) => (
  <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg shadow-inner border border-gray-200">
    <span className="text-slate-700 font-medium">{label}:</span>
    <span className={`text-xl font-bold ${valueClassName}`}>{value}</span>
  </div>
);

/**
 * A skeleton loader for the stats card.
 */
const StatSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-12 bg-gray-700 rounded-lg"></div>
    <div className="h-12 bg-gray-700 rounded-lg"></div>
    <div className="h-12 bg-gray-700 rounded-lg"></div>
  </div>
);

// --- Main TeacherDashboard Component ---

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingListing, setIsProcessingListing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'

  // State for dynamic dashboard data
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    newInquiries: 0,
    totalEarnings: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // A single state for listing status
  const [isListed, setIsListed] = useState(false);

  // Function to show transient messages (e.g., success, error)
  const showMessage = useCallback((text, type = 'info', duration = 3000) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, duration);
  }, []);

  // Consolidated function to fetch user data and listing status
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let user = getFromLocalStorage('currentUser');

      if (token) {
        try {
          const cleanToken = token.replace(/^"(.*)"$/, '$1');
          const response = await fetch('http://localhost:5000/api/profile/teacher', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${cleanToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const profileData = await response.json();
            user = {
              ...user,
              ...profileData,
              id: user?.id || profileData._id,
              _id: user?._id || profileData._id,
              teacherProfileData: profileData.teacherProfile || user?.teacherProfileData,
            };
            setToLocalStorage('currentUser', user);
          } else {
            console.warn('Failed to fetch profile from backend, using localStorage');
          }
        } catch (apiError) {
          console.warn('Backend not available, using localStorage:', apiError);
        }
      }

      // If no user is found, redirect to login
      if (!user || user.role !== 'teacher') {
        showMessage("Access denied. Please log in as a teacher.", 'error');
        navigate('/login', { replace: true });
        return;
      }
      
      // Ensure user has a valid ID for consistency
      const userWithId = { ...user, id: user.id || user._id || 101, _id: user._id || user.id || 101 };

      // Update state
      setCurrentUser(userWithId);
      setIsListed(userWithId.teacherProfileData?.isListed || false);
    } catch (error) {
      console.error("Failed to load user data:", error);
      showMessage("Error loading user data. Please try logging in again.", 'error');
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate, showMessage]);

  useEffect(() => {
    seedTeacherDashboardData(); // Ensure mock data exists
    fetchUserData();
    // Listen for storage changes to keep data in sync across tabs
    window.addEventListener('storage', fetchUserData);
    return () => {
      window.removeEventListener('storage', fetchUserData);
    };
  }, [fetchUserData]);

  // TODO: Replace with actual API calls to backend
  useEffect(() => {
    if (currentUser && (currentUser.id || currentUser._id)) {
      // For now, show zero values until backend APIs are implemented
      setStats({
        upcomingSessions: 0,
        newInquiries: 0,
        totalEarnings: 0,
      });
      setStatsLoading(false);
    }
  }, [currentUser]);

  const teacherProfile = currentUser?.teacherProfileData || currentUser?.teacherProfile || {};
  const isProfileComplete = currentUser?.profileComplete || false;

  const handleGetListed = async () => {
    try {
      setIsProcessingListing(true);

      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('Authentication token not found. Please log in.', 'error');
        navigate('/login');
        return;
      }

      // Call the API to update listing status
      const response = await fetch('http://localhost:5000/api/profile/teacher/listing', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.replace(/^"(.*)"$/, '$1')}`
        },
        body: JSON.stringify({ isListed: true })
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state and localStorage
        const updatedUser = {
          ...currentUser,
          teacherProfileData: {
            ...teacherProfile,
            isListed: true,
            listedAt: data.listedAt
          }
        };
        setCurrentUser(updatedUser);
        setToLocalStorage('currentUser', updatedUser);
        setIsListed(true); // Update the isListed state directly

        showMessage('🎉 Congratulations! You are now listed as a teacher. Students can find and book classes with you.', 'success');
      } else {
        const errorData = await response.json();
        showMessage(`Error: ${errorData.message || 'Failed to get listed.'}`, 'error');
      }
    } catch (error) {
      console.error('Error getting listed:', error);
      showMessage('Failed to get listed. Please try again.', 'error');
    } finally {
      setIsProcessingListing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
        <p className="text-purple-300 text-xl ml-4">Loading Dashboard...</p>
      </div>
    );
  }

  const getListingButtonTooltip = () => {
    if (isProcessingListing) return "Processing payment...";
    if (!isProfileComplete) return "Please complete your profile first to get listed.";
    return `Pay ₹${LISTING_FEE} to get listed and found by students.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-100 to-purple-100 text-slate-900 font-inter p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Animated gradient orbs for background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl animate-float-slow"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Global Message/Toast */}
      {message && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-fade-in-down ${
          messageType === 'success' ? 'bg-emerald-600 text-white' :
          messageType === 'error' ? 'bg-red-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          {messageType === 'success' && <CheckCircle className="w-5 h-5" />}
          {messageType === 'error' && <XCircle className="w-5 h-5" />}
          {messageType === 'info' && <Info className="w-5 h-5" />}
          <span className="font-semibold">{message}</span>
        </div>
      )}

      <header className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Teacher Profile Image */}
          <div className="relative animate-float">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-400 shadow-lg bg-gray-200 hover:border-purple-300 transition-all duration-300">
              {currentUser?.teacherProfileData?.photoUrl || currentUser?.teacherProfile?.photoUrl ? (
                <img
                  src={currentUser.teacherProfileData?.photoUrl || currentUser.teacherProfile?.photoUrl}
                  alt={`${currentUser?.firstName} ${currentUser?.lastName}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-violet-500 text-white text-2xl font-bold">
                  {currentUser?.firstName ? currentUser.firstName.charAt(0).toUpperCase() : 'T'}
                </div>
              )}
            </div>
            {/* Online Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center animate-pulse-slow">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Header Text */}
          <div className="text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400 flex items-center gap-3">
              <LayoutDashboard className="w-10 h-10 text-purple-400" /> Teacher Dashboard
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Welcome back, <span className="font-semibold text-purple-300">{currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : 'Teacher'}!</span>
            </p>
            <p className="text-gray-500 text-sm">{currentUser?.email}</p>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              setToLocalStorage('currentUser', null); // Clear current user
              localStorage.removeItem('token'); // Also remove the token
              navigate('/login');
            }}
            className="px-6 py-2 bg-white/60 backdrop-blur-sm text-slate-700 rounded-lg hover:bg-white/80 transition-colors duration-200 flex items-center gap-2 shadow-sm border border-white/40"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </header>

      {!isProfileComplete && (
        <section className="bg-red-800/50 border-l-4 border-red-500 text-red-200 p-4 rounded-r-lg shadow-lg mb-8 flex flex-col sm:flex-row items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Settings className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="font-bold text-lg">Action Required: Complete Your Profile</h2>
              <p className="text-sm">Your profile is incomplete. Finish setup to get listed and connect with students.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/teacher/profile-setup')}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 flex items-center gap-2 shadow-sm font-semibold"
          >
            Complete Profile <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      <main className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {/* Listing Status Card */}
        <DashboardCard icon={ListChecks} title="Listing Status">
          <div className="text-center flex flex-col items-center justify-center h-full space-y-4">
            {isListed ? (
              <>
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-3 animate-fade-in" />
                <p className="text-emerald-400 font-bold text-xl">You are Listed!</p>
                <p className="text-gray-400 text-sm mt-1">Students can now find and book you.</p>
                {teacherProfile.listedAt && (
                  <p className="text-gray-500 text-xs mt-2">Listed since: {new Date(teacherProfile.listedAt).toLocaleDateString()}</p>
                )}
              </>
            ) : (
              <>
                <Info className="w-16 h-16 text-amber-500 mb-3 animate-fade-in" />
                <p className="text-amber-400 font-bold text-xl">Not Yet Listed</p>
                <p className="text-gray-400 text-sm mt-1 mb-4">Appear in searches and receive bookings.</p>
                <button
                  onClick={handleGetListed}
                  disabled={isProcessingListing || !isProfileComplete}
                  title={getListingButtonTooltip()}
                  className={`mt-4 px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2.5 transition-all duration-300 shadow-lg
                    disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none
                    ${isProfileComplete ? 'bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 transform hover:scale-105' : 'bg-gray-700'}`}
                >
                  {isProcessingListing ? (
                    <> <Loader2 className="w-5 h-5 animate-spin" /> Processing... </>
                  ) : (
                    <> <Wallet className="w-5 h-5" /> Get Listed (₹{LISTING_FEE} Fee) </>
                  )}
                </button>
              </>
            )}
          </div>
        </DashboardCard>

        {/* Your Summary Card */}
        <DashboardCard icon={DollarSign} title="Your Summary">
          {statsLoading ? (
            <StatSkeleton />
          ) : (
            <div className="space-y-4">
              <StatRow label="Upcoming Sessions" value={stats.upcomingSessions} />
              <StatRow label="New Inquiries" value={stats.newInquiries} />
              <StatRow
                label="Total Earnings"
                value={stats.totalEarnings.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              />
              {/* Info message when no data */}
              {stats.upcomingSessions === 0 && stats.newInquiries === 0 && stats.totalEarnings === 0 && (
                <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-xs font-medium flex items-center gap-1 whitespace-nowrap overflow-x-auto">
                    <Info className="w-4 h-4 text-blue-400" />
                    Data will update when you receive bookings and inquiries.
                  </p>
                </div>
              )}
            </div>
          )}
        </DashboardCard>

        {/* Quick Actions Card */}
        <DashboardCard icon={LayoutDashboard} title="Quick Actions">
          <ul className="space-y-3">
            {[
              { label: 'Edit Profile', icon: UserRound, path: '/teacher/profile-setup' },
              { label: 'Manage Schedule', icon: CalendarDays, path: '/teacher/schedule' },
              { label: 'View Bookings', icon: Users, path: '/teacher/bookings' },
              { label: 'Messages', icon: MessageSquare, path: '/teacher/messages' },
              { label: 'My Achievements', icon: Award, path: '/teacher/achievements' },
            ].map(({ label, icon: Icon, path }) => (
              <li key={path}>
                <button
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-100 text-slate-800 rounded-lg hover:bg-gray-200 hover:text-purple-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:scale-[1.01]"
                >
                  <Icon className="w-6 h-6 text-purple-400" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </DashboardCard>

        {/* Recent Bookings/Sessions Card */}
        {/* TODO: Implement GET /api/teacher/bookings/recent endpoint */}
        <DashboardCard icon={MonitorCheck} title="Recent Activity" className="md:col-span-2 xl:col-span-3">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Latest Bookings</h3>
          <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
            {/* TODO: Replace with actual booking data from backend */}
            <div className="text-center py-8">
              <MonitorCheck className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg font-medium">No bookings yet</p>
              <p className="text-gray-500 text-sm mt-2">
                When students book sessions with you, they'll appear here.
              </p>
            </div>
          </div>
        </DashboardCard>
      </main>

      {/* Tailwind CSS Custom Scrollbar and Animation Definitions */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8b5cf6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a78bfa;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      </div>
    </div>
  );
}