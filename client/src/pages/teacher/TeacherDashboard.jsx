import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Users, DollarSign, LogOut,  UserRound, ArrowRight, CheckCircle, Wallet, ListChecks, LayoutDashboard, Settings, Loader2, Info, XCircle, Bell, MessageSquare, Award, MonitorCheck
} from 'lucide-react';

// Import your storage utility functions
import { getFromLocalStorage, setToLocalStorage } from "../utils/storage";

// --- Constants ---
const LISTING_FEE = 100; // Define listing fee as a constant for easy updates.

// --- Mock Data Seeding (for demonstration) ---
// In a real application, this data would come from a backend API.
const seedTeacherDashboardData = () => {
  // Ensure 'currentUser' exists for a teacher
  if (!getFromLocalStorage('currentUser')) {
    setToLocalStorage('currentUser', {
      id: 101,
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
        photoPreviewUrl: 'https://randomuser.me/api/portraits/women/68.jpg'
      }
    });
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

  // Mock bookings for upcoming sessions and new inquiries
  if (!getFromLocalStorage('teacherBookings')) {
    setToLocalStorage('teacherBookings', [
      { id: 'b1', teacherId: 101, studentName: 'Rahul Sharma', subject: 'Physics', date: '2025-07-05', time: '10:00 AM', status: 'confirmed' },
      { id: 'b2', teacherId: 101, studentName: 'Priya Singh', subject: 'Mathematics', date: '2025-07-06', time: '04:00 PM', status: 'pending' },
      { id: 'b3', teacherId: 101, studentName: 'Amit Kumar', subject: 'Physics', date: '2025-07-07', time: '11:00 AM', status: 'confirmed' },
      { id: 'b4', teacherId: 102, studentName: 'Another Student', subject: 'Chemistry', date: '2025-07-08', time: '01:00 PM', status: 'confirmed' }, // For another teacher
    ]);
  }

  // Mock inquiries/messages
  if (!getFromLocalStorage('teacherInquiries')) {
    setToLocalStorage('teacherInquiries', [
      { id: 'i1', teacherId: 101, studentName: 'Student A', message: 'Interested in Class 12 Physics for JEE.', read: false, timestamp: '2025-07-01T10:00:00Z' },
      { id: 'i2', teacherId: 101, studentName: 'Student B', message: 'Availability for weekend math classes?', read: false, timestamp: '2025-07-01T11:30:00Z' },
      { id: 'i3', teacherId: 101, studentName: 'Student C', message: 'Can you teach advanced calculus?', read: true, timestamp: '2025-06-28T15:00:00Z' },
    ]);
  }
};
// --- End Mock Data Seeding ---

/**
 * A reusable card component for the dashboard grid with futuristic styling.
 * @param {{ icon: React.ElementType, title: string, children: React.ReactNode, className?: string }} props
 */
const DashboardCard = ({ icon: Icon, title, children, className = '' }) => (
  <div className={`relative bg-gray-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden
    transform hover:scale-[1.02] transition-all duration-300 hover:shadow-violet-700/50 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 to-purple-900/10 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className="w-8 h-8 text-purple-400" />}
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-purple-300">{title}</h2>
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
const StatRow = ({ label, value, valueClassName = 'text-purple-300' }) => (
  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg shadow-inner border border-gray-600">
    <span className="text-gray-300 font-medium">{label}:</span>
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

  // Function to show transient messages (e.g., success, error)
  const showMessage = useCallback((text, type = 'info', duration = 3000) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, duration);
  }, []);

  const fetchUserData = useCallback(() => {
    try {
      const user = getFromLocalStorage('currentUser');
      if (user && user.role === 'teacher') {
        setCurrentUser(user);
      } else {
        showMessage("Access denied. Please log in as a teacher.", 'error');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
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

  // Simulate fetching dashboard metrics from an API
  useEffect(() => {
    if (currentUser && currentUser.id) { // Ensure currentUser and its ID are available
      setStatsLoading(true);
      setTimeout(() => {
        const teacherBookings = getFromLocalStorage('teacherBookings', []);
        const teacherInquiries = getFromLocalStorage('teacherInquiries', []);

        const upcomingSessions = teacherBookings.filter(b =>
          b.teacherId === currentUser.id &&
          b.status === 'confirmed' &&
          new Date(b.date) >= new Date() // Only count future dates
        ).length;

        const newInquiries = teacherInquiries.filter(i =>
          i.teacherId === currentUser.id && !i.read
        ).length;

        // Simplified earnings calculation for mock data
        const totalEarnings = teacherBookings.filter(b =>
          b.teacherId === currentUser.id && b.status === 'confirmed'
        ).length * 800; // Assuming 800 INR per confirmed session for simplicity

        setStats({
          upcomingSessions,
          newInquiries,
          totalEarnings,
        });
        setStatsLoading(false);
      }, 1500); // Simulate network delay
    }
  }, [currentUser]);

  const teacherProfile = currentUser?.teacherProfileData || {};
  const isProfileComplete = currentUser?.profileComplete || false;
  const isListed = teacherProfile.isListed || false;

  const handleGetListed = useCallback(async () => {
    if (isProcessingListing || !isProfileComplete) return;

    setIsProcessingListing(true);
    showMessage("Processing your listing fee...", 'info');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2500));

      const updatedUser = {
        ...currentUser,
        teacherProfileData: {
          ...currentUser.teacherProfileData,
          isListed: true,
          listedAt: new Date().toISOString(),
        },
      };

      // Update both currentUser and the main registeredUsers list for consistency
      setToLocalStorage('currentUser', updatedUser);
      let allUsers = getFromLocalStorage('registeredUsers', []);
      const updatedAllUsers = allUsers.map(user =>
        user.email === updatedUser.email ? updatedUser : user
      );
      setToLocalStorage('registeredUsers', updatedAllUsers);

      setCurrentUser(updatedUser); // Update state to trigger re-render
      showMessage("Congratulations! You are now listed and discoverable! 🎉", 'success');

    } catch (error) {
      console.error("Error updating localStorage after listing:", error);
      showMessage("Failed to update listing status. Please try again.", 'error');
    } finally {
      setIsProcessingListing(false);
    }
  }, [isProcessingListing, isProfileComplete, currentUser, showMessage]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 font-inter p-4 sm:p-6 lg:p-10">
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
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400 flex items-center justify-center gap-3">
          <LayoutDashboard className="w-10 h-10 text-purple-400" /> Teacher Dashboard
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Welcome back, <span className="font-semibold text-purple-300">{teacherProfile.firstName || 'Teacher'}!</span>
        </p>
        <p className="text-gray-500 text-sm">{currentUser.email}</p>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              setToLocalStorage('currentUser', null); // Clear current user
              navigate('/login');
            }}
            className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2 shadow-md"
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
              { label: 'View Inquiries', icon: MessageSquare, path: '/teacher/inquiries' },
              { label: 'My Achievements', icon: Award, path: '/teacher/achievements' },
            ].map(({ label, icon: Icon, path }) => (
              <li key={path}>
                <button
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 hover:text-white transition-all duration-200 font-semibold shadow-md hover:shadow-xl transform hover:scale-[1.01]"
                >
                  <Icon className="w-6 h-6 text-purple-400" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </DashboardCard>

        {/* Recent Bookings/Sessions (New Card) */}
        <DashboardCard icon={MonitorCheck} title="Recent Activity" className="md:col-span-2 xl:col-span-3">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Latest Bookings</h3>
          <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
            {/* Filter and map recent bookings for this teacher */}
            {getFromLocalStorage('teacherBookings', [])
              .filter(b => b.teacherId === currentUser.id)
              .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt)) // Sort by most recent
              .slice(0, 5) // Show up to 5 recent bookings
              .map(booking => (
                <div key={booking.id} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between shadow-sm border border-gray-600">
                  <div>
                    <p className="text-lg font-semibold text-gray-100">{booking.subject} with {booking.studentName}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" /> {booking.date} at {booking.time}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    booking.status === 'confirmed' ? 'bg-emerald-500 text-white' :
                    booking.status === 'pending' ? 'bg-amber-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              ))}
            {getFromLocalStorage('teacherBookings', []).filter(b => b.teacherId === currentUser.id).length === 0 && (
              <p className="text-gray-400 text-center py-4">No recent bookings yet.</p>
            )}
          </div>
        </DashboardCard>

      </main>

      {/* Tailwind CSS Custom Scrollbar and Animation Definitions */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333; /* Darker track for futuristic theme */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8b5cf6; /* purple-500 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a78bfa; /* purple-400 */
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
      `}</style>
    </div>
  );
}
