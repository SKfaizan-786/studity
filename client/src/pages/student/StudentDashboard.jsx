import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Loader2,
  Bell,
  Search,
  ChevronDown,
  ChevronUp,
  LogOut,
  MessageSquare,
  User,
  ClipboardPenLine,
  ChevronLeft,
  ChevronRight,
  Menu,
  Calendar,
  Clock,
  Users,
  Heart,
  Video,
  MapPin,
  DollarSign,
  TrendingUp,
  Bookmark,
  BookCheck,
  Star,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';

// --- Context for Current User ---
// This prevents prop drilling and ensures user data is consistently available.
const UserContext = createContext(null);

// --- Helper Functions for Local Storage Consistency ---
// Importing directly from the utility file
import { getFromLocalStorage, setToLocalStorage } from '../utils/storage';
import { useNotifications } from '../../contexts/NotificationContext';
// --- End Helper Functions ---

// --- Sample Data (replace with your actual data fetching logic) ---
const getSampleStudentData = (firstName = 'Student') => {
  return {
    firstName: firstName,
    lastName: 'User',
    email: 'student@example.com',
    profilePic: 'https://via.placeholder.com/150/9CA3AF/FFFFFF?text=SU',
    stats: {
      upcomingSessions: 0,
      completedSessions: 0,
      favoriteTeachers: 0,
      totalSpent: 0
    },
    upcomingSessions: [],
    recentTeachers: [],
    notifications: []
  };
};

// --- Sub-Components ---

const SidebarButton = ({ icon: Icon, text, onClick, isActive, count, isCollapsed = false }) => {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`group flex items-center w-full rounded-xl text-left font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg overflow-hidden ${
          isCollapsed ? 'p-3 justify-center' : 'p-3'
        } ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-slate-700 hover:bg-white/60 hover:text-blue-600 hover:backdrop-blur-sm'
        }`}
        title={isCollapsed ? text : ''}
      >
        <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'} transition-colors duration-300 flex-shrink-0`} />
        {!isCollapsed && (
          <>
            <span className="transition-all duration-300 truncate">{text}</span>
            {count > 0 && (
              <span
                className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-300 flex-shrink-0 ${
                  isActive ? 'bg-white text-blue-600' : 'bg-blue-500 text-white group-hover:bg-blue-600 group-hover:text-white'
                }`}
              >
                {count}
              </span>
            )}
          </>
        )}
      </button>
      {isCollapsed && count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border border-white shadow-sm">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  );
};

const MainHeader = ({ currentUser }) => {
  // Use notification context
  const { unreadCount } = useNotifications();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const handleLogout = () => {
    setToLocalStorage('currentUser', null); // Clear current user on logout
    navigate('/login');
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Good {getTimeOfDay()}, <span className="text-blue-600">{currentUser.firstName}!</span>
        </h1>
        <p className="text-slate-600 text-lg">Welcome back to your personalized dashboard.</p>
      </div>
      <div className="flex items-center space-x-4 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-slate-700 placeholder-slate-400 shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-3 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-200 shadow-sm"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce-once">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div
          className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-200"
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
        >
          {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
        </div>

        {profileDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-50 animate-fade-in-down transform scale-95 origin-top-right transition-all duration-200">
            <div className="flex items-center space-x-3 px-4 py-3 border-b border-slate-100 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-md"> {/* Theme accent */}
                {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-sm text-slate-500">{currentUser.email}</p>
              </div>
            </div>
            <Link to={currentUser.role === 'student' ? "/student/profile" : "/teacher/profile"} className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors duration-150">
              <User className="w-4 h-4 mr-2 text-purple-500" /> {/* Theme accent */}
              View Profile
            </Link>
            <div className="border-t border-slate-100 mt-2 pt-2">
              <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-150">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, description }) => {
  // Theme-consistent colors for stat cards
  const colorClasses = {
    // These match the Signup header gradients
    primary: 'from-violet-600 to-indigo-600',
    secondary: 'from-purple-600 to-pink-600',
    accent: 'from-blue-600 to-cyan-600', // A new addition for variety within the theme
    success: 'from-emerald-500 to-green-600',
  };

  const gradient = colorClasses[color] || colorClasses.primary; // Default to primary if color not found

  return (
    <div className={`relative p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/40 overflow-hidden transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <div className={`p-2 rounded-full text-white bg-gradient-to-br ${gradient} shadow-md`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
};

const SessionCard = ({ session }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:bg-white/80 transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={session.teacherProfile} 
            alt={session.teacherName}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">{session.teacherName}</h4>
            <p className="text-purple-600 text-xs font-medium">{session.subject}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          session.type === 'online' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {session.type === 'online' ? <Video className="w-3 h-3 inline mr-1" /> : <MapPin className="w-3 h-3 inline mr-1" />}
          {session.type}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-slate-600 text-sm">
          <Calendar className="w-4 h-4 mr-2 text-purple-500" />
          {formatDate(session.date)}
        </div>
        <div className="flex items-center text-slate-600 text-sm">
          <Clock className="w-4 h-4 mr-2 text-purple-500" />
          {session.time} ({session.duration})
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <button className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-200">
          Join Session
        </button>
        <button className="px-3 py-2 border border-purple-200 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-50 transition-all duration-200">
          Reschedule
        </button>
      </div>
    </div>
  );
};

const TeacherCard = ({ teacher }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/40 hover:bg-white/80 transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={teacher.image} 
            alt={teacher.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">{teacher.name}</h4>
            <p className="text-slate-600 text-xs">{teacher.experience}</p>
          </div>
        </div>
        <button className={`p-2 rounded-full transition-all duration-200 ${
          teacher.isFavorite 
            ? 'text-red-500 bg-red-50 hover:bg-red-100' 
            : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
        }`}>
          <Heart className={`w-4 h-4 ${teacher.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex flex-wrap gap-1">
          {teacher.subjects.slice(0, 2).map((subject, index) => (
            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              {subject}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center">
            <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
            <span>{teacher.rating}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            <span>{teacher.students} students</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm font-semibold text-slate-800">
          <DollarSign className="w-4 h-4 text-green-600 mr-1" />
          ₹{teacher.hourlyRate}/hour
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Link 
          to={`/student/book-class?teacher=${teacher.id}`}
          className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-200 text-center"
        >
          Book Class
        </Link>
        <button className="px-3 py-2 border border-purple-200 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-50 transition-all duration-200">
          View Profile
        </button>
      </div>
    </div>
  );
};

const NotificationItem = ({ notification }) => {
  const notificationIcon = {
    session: <Calendar className="w-5 h-5 text-purple-500" />,
    booking: <BookCheck className="w-5 h-5 text-emerald-500" />,
    reminder: <Bell className="w-5 h-5 text-amber-500" />,
    message: <MessageSquare className="w-5 h-5 text-blue-500" />,
    alert: <AlertTriangle className="w-5 h-5 text-red-500" />,
  };

  return (
    <div className={`flex items-start p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md ${notification.read ? 'bg-slate-50 text-slate-600' : 'bg-purple-50 text-slate-800 font-medium border border-purple-200'}`}> {/* Theme accent */}
      <div className="mr-3 flex-shrink-0">
        {notificationIcon[notification.type] || <Bell className="w-5 h-5 text-slate-400" />}
      </div>
      <div className="flex-1">
        <p className="text-sm">{notification.message}</p>
        <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
      </div>
      {!notification.read && (
        <span className="ml-3 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
      )}
    </div>
  );
};

// --- Main StudentDashboard Component ---
const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard'); // State for active sidebar item
  const [dashboardData, setDashboardData] = useState(null); // All data for the dashboard
  const [mockTeachers, setMockTeachers] = useState([]); // For storing teacher data
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State for sidebar collapse
  const [loading, setLoading] = useState(false); // For loading state
  
  // Use notification context
  const { unreadCount } = useNotifications();

  // Effect to load current user and dashboard data
  useEffect(() => {
    // Correctly use the imported getFromLocalStorage
    const user = getFromLocalStorage('currentUser', null);
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    // For simplicity, directly set sample data. In a real app, you'd fetch this.
    setCurrentUser(user);
    const sampleData = getSampleStudentData(user.firstName);
    setDashboardData(sampleData);

    // Simulate real-time updates for notifications (e.g., mark as read)
    const interval = setInterval(() => {
      setDashboardData(prevData => {
        if (!prevData) return prevData;
        const unreadNotifications = prevData.notifications.filter(n => !n.read);
        if (unreadNotifications.length > 0) {
          const updatedNotifications = prevData.notifications.map(n =>
            n.id === unreadNotifications[0].id ? { ...n, read: true } : n
          );
          return { ...prevData, notifications: updatedNotifications };
        }
        return prevData;
      });
    }, 15000); // Mark one unread notification as read every 15 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  // Update the fetchTeachers function to only get listed teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      
      // Try API first
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/teachers/list', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const teachers = await response.json();
            setMockTeachers(teachers);
            return;
          }
        } catch (apiError) {
          console.log('API not available, using localStorage...');
        }
      }
      
      // Fallback to localStorage - only show listed teachers
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const listedTeachers = allUsers.filter(user => 
        user.role === 'teacher' && 
        user.teacherProfile && 
        user.teacherProfile.isListed === true // Only listed teachers
      );
      
      setMockTeachers(listedTeachers);
      
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const cleanToken = token.replace(/^"(.*)"$/, '$1');
        let userForDashboard = null;

        // First try to fetch fresh data from backend
        try {
          const response = await fetch('http://localhost:5000/api/profile/student', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${cleanToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const profileData = await response.json();
            console.log('Fetched profile data:', profileData);
            // Only redirect if profileComplete is false
            if (!profileData.profileComplete) {
              navigate('/student/profile');
              return;
            }
            setCurrentUser(profileData);
            setToLocalStorage('currentUser', profileData);
            userForDashboard = profileData;
          } else {
            throw new Error('Failed to fetch profile');
          }
        } catch (error) {
          console.warn('Failed to fetch from backend, checking localStorage:', error);
          // Fallback to localStorage
          const currentUser = getFromLocalStorage('currentUser');
          if (!currentUser || !currentUser.profileComplete) {
            navigate('/student/profile');
            return;
          }
          setCurrentUser(currentUser);
          userForDashboard = currentUser;
        }

        setDashboardData(getSampleStudentData(userForDashboard.firstName));
        await fetchTeachers();
      } catch (error) {
        console.error('Error loading dashboard:', error);
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  // No longer needed as we use notification context
  // const unseenNotificationsCount = dashboardData?.notifications.filter(n => !n.read).length || 0;

  if (!currentUser || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 text-slate-700">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Common Tailwind classes for consistency
  const cardClass = "relative p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/40";
  const sectionTitleClass = "text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3";

  const sidebarClass = `${isSidebarCollapsed ? 'w-24' : 'w-72'} bg-white/80 backdrop-blur-xl border-r border-white/20 ${isSidebarCollapsed ? 'p-4' : 'p-6'} flex flex-col relative overflow-hidden shadow-lg z-10 transition-all duration-300`; 
  const mainContentClass = `flex-1 p-8 overflow-y-auto`;

  return (
    <UserContext.Provider value={currentUser}>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
        {/* Animated gradient orbs for background effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl animate-float-slow"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className={sidebarClass}>
          <div className="relative z-10 flex flex-col h-full">
            {/* Collapse Toggle Button */}
            <div className={`flex items-center mb-8 ${isSidebarCollapsed ? 'flex-col space-y-4' : 'justify-between'}`}>
              {!isSidebarCollapsed && (
                <Link to="/" className="flex items-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 transform group-hover:scale-105 transition-all duration-300">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">Yuvshiksha</h2>
                    <p className="text-slate-600 text-xs group-hover:text-slate-700 transition-colors duration-200">Student Portal</p>
                  </div>
                </Link>
              )}
              
              {isSidebarCollapsed && (
                <Link to="/" className="group mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-lg">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                </Link>
              )}
              
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`p-2 rounded-lg hover:bg-white/60 transition-colors duration-200 text-slate-600 hover:text-blue-600 shadow-sm ${isSidebarCollapsed ? 'w-full' : ''}`}
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>

            <nav className={`flex-1 mb-8 overflow-hidden ${isSidebarCollapsed ? 'space-y-3' : 'space-y-2'}`}>
              <SidebarButton
                icon={Home}
                text="Dashboard"
                onClick={() => setActiveMenuItem('dashboard')}
                isActive={activeMenuItem === 'dashboard'}
                isCollapsed={isSidebarCollapsed}
              />
              <SidebarButton
                icon={Calendar}
                text="My Sessions"
                onClick={() => setActiveMenuItem('sessions')}
                isActive={activeMenuItem === 'sessions'}
                count={dashboardData?.upcomingSessions?.length || 0}
                isCollapsed={isSidebarCollapsed}
              />
              <SidebarButton
                icon={Bookmark}
                text="Favorites"
                onClick={() => setActiveMenuItem('favorites')}
                isActive={activeMenuItem === 'favorites'}
                count={dashboardData?.recentTeachers?.filter(t => t.isFavorite).length || 0}
                isCollapsed={isSidebarCollapsed}
              />
              
              {/* Navigation Links */}
              <div className="border-t border-white/20 pt-4 mt-4">
                <Link
                  to="/student/find-teachers"
                  className={`flex items-center w-full p-3 text-left text-slate-700 hover:bg-white/40 rounded-xl transition-all duration-200 group overflow-hidden ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
                  title={isSidebarCollapsed ? 'Find Teachers' : ''}
                >
                  <Search className="w-5 h-5 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0" />
                  {!isSidebarCollapsed && <span className="group-hover:text-blue-600 transition-colors duration-200 truncate">Find Teachers</span>}
                </Link>
                <Link
                  to="/student/messages"
                  className={`flex items-center w-full p-3 text-left text-slate-700 hover:bg-white/40 rounded-xl transition-all duration-200 group overflow-hidden ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
                  title={isSidebarCollapsed ? 'Messages' : ''}
                >
                  <MessageSquare className="w-5 h-5 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0" />
                  {!isSidebarCollapsed && <span className="group-hover:text-blue-600 transition-colors duration-200 truncate">Messages</span>}
                </Link>
              </div>
            </nav>

            <div className="mt-auto">
              <button
                onClick={() => {
                  // Correctly use the imported setToLocalStorage
                  setToLocalStorage('currentUser', null); // Clear current user
                  navigate('/login');
                }}
                className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg flex items-center justify-center transform hover:scale-[1.02] hover:-translate-y-1 ${isSidebarCollapsed ? 'py-3 px-3' : 'py-3 space-x-2'}`}
                title={isSidebarCollapsed ? 'Logout' : ''}
              >
                <LogOut className={`w-5 h-5 ${isSidebarCollapsed ? '' : ''}`} />
                {!isSidebarCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={mainContentClass}>
          <MainHeader currentUser={currentUser} />

          {activeMenuItem === 'dashboard' && (
            <section className="space-y-10">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Upcoming Sessions"
                  value={dashboardData.stats.upcomingSessions}
                  icon={Calendar}
                  color="primary"
                  description="Next 7 days"
                />
                <StatCard
                  title="Completed Sessions"
                  value={dashboardData.stats.completedSessions}
                  icon={BookCheck}
                  color="secondary"
                  description="All time"
                />
                <StatCard
                  title="Favorite Teachers"
                  value={dashboardData.stats.favoriteTeachers}
                  icon={Heart}
                  color="accent"
                  description="Bookmarked"
                />
                <StatCard
                  title="Total Spent"
                  value={`₹${dashboardData.stats.totalSpent.toLocaleString()}`}
                  icon={DollarSign}
                  color="success"
                  description="Learning investment"
                />
              </div>

              {/* Upcoming Sessions */}
              <div className={cardClass}>
                <h2 className={sectionTitleClass}>
                  <Calendar className="w-7 h-7 text-purple-600" />
                  Upcoming Sessions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.upcomingSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
                {dashboardData.upcomingSessions.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg mb-4">No upcoming sessions</p>
                    <Link 
                      to="/student/find-teachers"
                      className="inline-flex items-center bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-200"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Find Teachers
                    </Link>
                  </div>
                )}
              </div>

              {/* Recommended Teachers */}
              <div className={cardClass}>
                <h2 className={sectionTitleClass}>
                  <Users className="w-7 h-7 text-purple-600" />
                  Recommended Teachers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {dashboardData.recentTeachers.map(teacher => (
                    <TeacherCard key={teacher.id} teacher={teacher} />
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link 
                    to="/student/find-teachers"
                    className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                  >
                    View All Teachers
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Recent Notifications */}
              <div className={cardClass}>
                <h2 className={sectionTitleClass}>
                  <Bell className="w-7 h-7 text-purple-600" />
                  Recent Notifications
                </h2>
                <div className="space-y-4">
                  {dashboardData.notifications.slice(0, 4).map(notification => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                  {dashboardData.notifications.length === 0 && (
                    <p className="text-slate-500 text-center py-4">No new notifications.</p>
                  )}
                </div>
                {dashboardData.notifications.length > 4 && (
                  <div className="text-center mt-6">
                    <Link to="/student/notifications" className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors duration-200"> {/* Theme accent */}
                      View All Notifications <ChevronUp className="w-4 h-4 ml-1 transform rotate-90" />
                    </Link>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Individual Section Views */}
          {activeMenuItem === 'sessions' && (
            <section>
              <h2 className={sectionTitleClass}>
                <Calendar className="w-7 h-7 text-purple-600" /> My Sessions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.upcomingSessions.map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
              {dashboardData.upcomingSessions.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg mb-4">No sessions scheduled</p>
                  <Link 
                    to="/student/find-teachers"
                    className="inline-flex items-center bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-200"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Book Your First Session
                  </Link>
                </div>
              )}
            </section>
          )}

          {activeMenuItem === 'favorites' && (
            <section>
              <h2 className={sectionTitleClass}>
                <Heart className="w-7 h-7 text-purple-600" /> Favorite Teachers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dashboardData.recentTeachers.filter(teacher => teacher.isFavorite).map(teacher => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ))}
              </div>
              {dashboardData.recentTeachers.filter(teacher => teacher.isFavorite).length === 0 && (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg mb-4">No favorite teachers yet</p>
                  <p className="text-slate-400 mb-6">Start exploring and save your favorite teachers for quick access</p>
                  <Link 
                    to="/student/find-teachers"
                    className="inline-flex items-center bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-200"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Discover Teachers
                  </Link>
                </div>
              )}
            </section>
          )}

        </main>
        </div>
      </div>
    </UserContext.Provider>
  );
};

export default StudentDashboard;