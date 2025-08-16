import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, Clock, BookOpen, Award, ChevronDown, X, Check, Heart, MapPin, Calendar, DollarSign, Users, Zap, SlidersHorizontal, Loader2, MessageCircle } from "lucide-react";
import API_CONFIG from '../../config/api';

// Add this debug function before the main component
const debugTeacherData = (teachers) => {
  console.log('🔍 DEBUGGING TEACHER DATA:');
  console.log('Total teachers received:', teachers.length);
  
  teachers.forEach((teacher, index) => {
    console.log(`Teacher ${index + 1}:`, {
      name: teacher.name,
      isListed: teacher.teacherProfile?.isListed,
      subjects: teacher.teacherProfile?.subjectsTaught || teacher.teacherProfile?.subjects,
      profile: teacher.teacherProfile
    });
  });
};

export default function EnhancedTeacherPlatform() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBoard, setFilterBoard] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [experienceRange, setExperienceRange] = useState([0, 10]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "",
    duration: "1",
    message: "",
  });
  const [notification, setNotification] = useState("");

  const navigate = useNavigate();

  // Fetch real teachers from backend
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      console.log('🔍 Frontend: Fetching teachers...');
      console.log('🔑 Token:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
      console.log('👤 Current User:', currentUser);
      console.log('🎭 User Role:', currentUser.role);
      
      if (!token) {
        console.log('❌ No token found');
        
        // If we have a valid user but no token, try to work with localStorage only
        if (currentUser && currentUser.role) {
          console.log('👤 Valid user found, using localStorage fallback only');
          
          // Skip API calls and go directly to localStorage fallback
          const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
          console.log('📦 All users in localStorage:', allUsers);
          
          // If no users in localStorage but we have a current teacher user, add them
          let usersToCheck = allUsers;
          if (allUsers.length === 0 && currentUser.role === 'teacher' && currentUser.teacherProfile) {
            console.log('📝 Adding current teacher to users list');
            usersToCheck = [currentUser];
            localStorage.setItem('users', JSON.stringify([currentUser]));
          }
          
          const listedTeachers = usersToCheck.filter(user => {
            const isTeacher = user.role === 'teacher';
            const hasProfile = user.teacherProfile;
            const isListed = user.teacherProfile?.isListed === true;
            
            console.log(`👤 Checking user ${user.email || user.firstName}: teacher=${isTeacher}, hasProfile=${hasProfile}, isListed=${isListed}`);
            
            return isTeacher && hasProfile && isListed;
          });

          console.log('🎯 Listed teachers from localStorage:', listedTeachers);

          const formattedTeachers = listedTeachers.map(teacher => ({
            id: teacher._id || teacher.id,
            name: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher',
            subject: teacher.teacherProfile?.subjects?.[0] || teacher.teacherProfile?.subjectsTaught?.[0] || 'General',
            board: teacher.teacherProfile?.boards?.[0] || teacher.teacherProfile?.boardsTaught?.[0] || 'CBSE',
            experience: teacher.teacherProfile?.experienceYears || 1,
            fee: teacher.teacherProfile?.hourlyRate || 500,
            rating: teacher.rating || 4.5,
            totalStudents: teacher.totalStudents || 0,
            avatar: getTeacherAvatar(teacher),
            specializations: teacher.teacherProfile?.subjects || teacher.teacherProfile?.subjectsTaught || ['General'],
            location: teacher.teacherProfile?.location || 'India',
            availability: getAvailabilityDays(teacher.teacherProfile?.availability) || ["Mon", "Wed", "Fri"],
            bio: teacher.teacherProfile?.bio || 'Experienced educator dedicated to student success.',
            languages: ["English", "Hindi"],
            qualifications: [teacher.teacherProfile?.qualifications || 'Graduate'],
            verified: true,
            email: teacher.email,
            phone: teacher.teacherProfile?.phone,
            teachingMode: teacher.teacherProfile?.teachingMode || 'hybrid',
            profilePicture: teacher.teacherProfile?.photoUrl
          }));

          console.log('🎯 Final formatted teachers:', formattedTeachers);
          setTeachers(formattedTeachers);
          setLoading(false);
          return;
        } else {
          console.log('❌ No valid user found');
          setError('Please login to view teachers');
          setLoading(false);
          return;
        }
      }

      // Use the API config instead of hardcoded URL
      const API_BASE_URL = API_CONFIG.BASE_URL;
      console.log('🌐 API Base URL:', API_BASE_URL);

      // Try to fetch from API first
      try {
        // First, let's try the debug endpoint
        console.log('🐛 Trying debug endpoint...');
        const debugResponse = await fetch(`${API_BASE_URL}${API_CONFIG.ENDPOINTS.TEACHERS_DEBUG}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('🐛 Debug response status:', debugResponse.status);
        
        if (debugResponse.ok) {
          const debugData = await debugResponse.json();
          console.log('🐛 Debug data:', debugData);
        } else {
          console.log('🐛 Debug endpoint failed:', await debugResponse.text());
        }

        // Now try the regular list endpoint
        console.log('📋 Trying teachers list endpoint...');
        const response = await fetch(`${API_BASE_URL}${API_CONFIG.ENDPOINTS.TEACHERS_LIST}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 API Response status:', response.status);

        if (response.ok) {
          const teachersData = await response.json();
          console.log('📊 API returned teachers:', teachersData);
          debugTeacherData(teachersData); // Add this line
          
          // Format teachers data for the UI
          const formattedTeachers = teachersData.map(teacher => {
            console.log('🔄 Formatting teacher:', teacher);
            
            // Handle both possible data structures for subjects
            const subjects = teacher.teacherProfile?.subjectsTaught || 
                            teacher.teacherProfile?.subjects || 
                            [];
            const boards = teacher.teacherProfile?.boardsTaught || 
                          teacher.teacherProfile?.boards || 
                          [];
            const classes = teacher.teacherProfile?.classesTaught || 
                           teacher.teacherProfile?.classes || 
                           [];

            return {
              id: teacher._id || teacher.id,
              name: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher',
              subject: Array.isArray(subjects) ? subjects[0]?.text || subjects[0] : subjects,
              board: Array.isArray(boards) ? boards[0]?.text || boards[0] : boards,
              experience: teacher.teacherProfile?.experienceYears || 1,
              fee: teacher.teacherProfile?.hourlyRate || 500,
              rating: teacher.rating || 4.5,
              totalStudents: teacher.totalStudents || 0,
              avatar: getTeacherAvatar(teacher),
              specializations: Array.isArray(subjects) ? subjects.map(s => s.text || s) : [subjects].filter(Boolean),
              location: teacher.teacherProfile?.location || 'India',
              availability: getAvailabilityDays(teacher.teacherProfile?.availability) || ["Mon", "Wed", "Fri"],
              bio: teacher.teacherProfile?.bio || 'Experienced educator dedicated to student success.',
              languages: ["English", "Hindi"],
              qualifications: [teacher.teacherProfile?.qualifications || 'Graduate'],
              verified: true,
              email: teacher.email,
              phone: teacher.teacherProfile?.phone,
              teachingMode: teacher.teacherProfile?.teachingMode || 'hybrid',
              profilePicture: teacher.teacherProfile?.photoUrl
            };
          });

          console.log('✅ Formatted teachers:', formattedTeachers);
          setTeachers(formattedTeachers);
          return;
        } else {
          const errorText = await response.text();
          console.error('❌ API Error:', response.status, errorText);
          
          if (response.status === 401) {
            console.log('🔑 Token might be invalid, but keeping user logged in and using localStorage fallback');
            // Don't immediately logout - just log the issue and fall back to localStorage
            console.warn('API authentication failed, falling back to localStorage data');
          }
          
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('⚠️ API not available, trying localStorage fallback...');
        console.error('API Error details:', apiError);
        
        // ALWAYS try localStorage fallback for now since API might not be working
        console.log('📦 Falling back to localStorage...');
        
        // Get all users from localStorage
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        console.log('📦 All users in localStorage:', allUsers);
        console.log('👤 Current user details:', currentUser);
        
        // If no users in localStorage but we have a current teacher user, add them
        let usersToCheck = allUsers;
        if (allUsers.length === 0 && currentUser.role === 'teacher' && currentUser.teacherProfile) {
          console.log('📝 Adding current teacher to users list');
          usersToCheck = [currentUser];
          // Also save to localStorage for future use
          localStorage.setItem('users', JSON.stringify([currentUser]));
        }
        
        const listedTeachers = usersToCheck.filter(user => {
          const isTeacher = user.role === 'teacher';
          const hasProfile = user.teacherProfile;
          const isListed = user.teacherProfile?.isListed === true;
          
          console.log(`👤 Checking user ${user.email || user.firstName}: teacher=${isTeacher}, hasProfile=${hasProfile}, isListed=${isListed}`);
          
          return isTeacher && hasProfile && isListed;
        });

        console.log('🎯 Listed teachers from localStorage:', listedTeachers);

        if (listedTeachers.length === 0) {
          console.log('📝 No listed teachers found. Checking if current user is a listed teacher...');
          
          // If current user is a teacher but not in the list, check their status
          if (currentUser.role === 'teacher' && currentUser.teacherProfile) {
            console.log('👨‍🏫 Current user is teacher with profile');
            console.log('📋 Teacher profile:', currentUser.teacherProfile);
            console.log('✅ isListed status:', currentUser.teacherProfile.isListed);
            
            if (currentUser.teacherProfile.isListed) {
              console.log('✅ Current teacher is listed, adding to display');
              listedTeachers.push(currentUser);
            }
          }
        }

        const formattedTeachers = listedTeachers.map(teacher => {
          // Handle both possible data structures
          const subjects = teacher.teacherProfile?.subjectsTaught || 
                          teacher.teacherProfile?.subjects || 
                          [];
          const boards = teacher.teacherProfile?.boardsTaught || 
                        teacher.teacherProfile?.boards || 
                        [];

          return {
            id: teacher._id || teacher.id,
            name: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher',
            subject: Array.isArray(subjects) ? (subjects[0]?.text || subjects[0]) : subjects,
            board: Array.isArray(boards) ? (boards[0]?.text || boards[0]) : boards,
            experience: teacher.teacherProfile?.experienceYears || 1,
            fee: teacher.teacherProfile?.hourlyRate || 500,
            rating: teacher.rating || 4.5,
            totalStudents: teacher.totalStudents || 0,
            avatar: getTeacherAvatar(teacher),
            specializations: Array.isArray(subjects) ? subjects.map(s => s.text || s).filter(Boolean) : [subjects].filter(Boolean),
            location: teacher.teacherProfile?.location || 'India',
            availability: getAvailabilityDays(teacher.teacherProfile?.availability) || ["Mon", "Wed", "Fri"],
            bio: teacher.teacherProfile?.bio || 'Experienced educator dedicated to student success.',
            languages: ["English", "Hindi"],
            qualifications: [teacher.teacherProfile?.qualifications || 'Graduate'],
            verified: true,
            email: teacher.email,
            phone: teacher.teacherProfile?.phone,
            teachingMode: teacher.teacherProfile?.teachingMode || 'hybrid',
            profilePicture: teacher.teacherProfile?.photoUrl
          };
        });

        console.log('🎯 Final formatted teachers:', formattedTeachers);
        setTeachers(formattedTeachers);
    }
  } catch (error) {
    console.error('❌ Error fetching teachers:', error);
    setError('Failed to load teachers. Please try again.');
  } finally {
    setLoading(false);
  }
  };

  // Helper function to get teacher avatar
  const getTeacherAvatar = (teacher) => {
    if (teacher.teacherProfile?.photoUrl) {
      return teacher.teacherProfile.photoUrl;
    }
    const firstName = teacher.firstName || teacher.name || 'T';
    return firstName.charAt(0).toUpperCase();
  };

  // Helper function to get availability days
  const getAvailabilityDays = (availability) => {
    if (!availability || !Array.isArray(availability)) return null;
    return availability.map(slot => slot.day).slice(0, 3);
  };

  // Load teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('teacherFavorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('teacherFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Animated notification system
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Advanced filtering and sorting
  const filteredAndSortedTeachers = useMemo(() => {
    let filtered = teachers.filter((teacher) => {
      const matchesSearch = 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specializations.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesBoard = !filterBoard || teacher.board === filterBoard;
      const matchesSubject = !filterSubject || teacher.subject === filterSubject;
      const matchesPrice = teacher.fee >= priceRange[0] && teacher.fee <= priceRange[1];
      const matchesExperience = teacher.experience >= experienceRange[0] && teacher.experience <= experienceRange[1];

      return matchesSearch && matchesBoard && matchesSubject && matchesPrice && matchesExperience;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "experience": return b.experience - a.experience;
        case "fee-low": return a.fee - b.fee;
        case "fee-high": return b.fee - a.fee;
        case "students": return b.totalStudents - a.totalStudents;
        default: return 0;
      }
    });

    return filtered;
  }, [teachers, searchTerm, filterBoard, filterSubject, sortBy, priceRange, experienceRange]);

  const handleBook = (teacher) => {
    setSelectedTeacher(teacher);
    setShowBookingModal(true);
  };

  const handleMessage = (teacher) => {
    // Navigate to messages page with the teacher's info
    navigate('/student/messages', { 
      state: { 
        startConversation: true,
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherAvatar: teacher.avatar
      }
    });
  };

  // Also update the submitBooking function to use correct API URL
  const submitBooking = async () => {
    try {
      const bookingData = {
        teacherId: selectedTeacher.id,
        subject: selectedTeacher.subject,
        date: bookingForm.date,
        time: bookingForm.time,
        duration: parseFloat(bookingForm.duration),
        notes: bookingForm.message,
        amount: selectedTeacher.fee * parseFloat(bookingForm.duration)
      };

      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BOOKINGS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const newBooking = await response.json();
        setBookings([...bookings, newBooking]);
        setShowBookingModal(false);
        setBookingForm({ date: "", time: "", duration: "1", message: "" });
        setNotification(`Booking request sent to ${selectedTeacher.name}! 🎉`);
      } else {
        const errorData = await response.json();
        setNotification(`Error: ${errorData.message || 'Failed to create booking'}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setNotification('Failed to create booking. Please try again.');
    }
  };

  const toggleFavorite = (teacherId) => {
    setFavorites(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
    setNotification(
      favorites.includes(teacherId) 
        ? "Removed from favorites ❤️" 
        : "Added to favorites! ❤️"
    );
  };

  const uniqueBoards = [...new Set(teachers.map(t => t.board))];
  const uniqueSubjects = [...new Set(teachers.map(t => t.subject))];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Teachers...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch available teachers</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchTeachers}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Try Again
            </button>
            <button
              onClick={checkLoginStatus}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Check Login Status
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    console.log('=== LOGIN STATUS CHECK ===');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Current User:', currentUser);
    console.log('User Role:', currentUser.role);
    console.log('Teacher Profile:', currentUser.teacherProfile);
    console.log('Is Listed:', currentUser.teacherProfile?.isListed);
    console.log('========================');
    
    if (!token || !currentUser.role) {
      alert('❌ You are not logged in. Please login first.');
      navigate('/login');
    } else {
      alert(`✅ Logged in as ${currentUser.role}: ${currentUser.firstName} ${currentUser.lastName}`);
    }
  };

  const generateTestToken = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.email) {
      alert('No user data found');
      return;
    }
    
    try {
      // Try to login with stored user data to get a fresh token
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: currentUser.email,
          password: 'yourpassword' // You'll need to enter the correct password
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        alert('✅ Token generated! Try fetching teachers again.');
        fetchTeachers();
      } else {
        alert('❌ Failed to generate token. Please login manually.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error generating token:', error);
      alert('❌ Error generating token. Please login manually.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-xl border border-white/20 text-slate-800 px-6 py-3 rounded-xl shadow-xl transform transition-all duration-300 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">{notification}</span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 animate-pulse">
            🌟 Find Your Perfect Teacher 🌟
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Discover qualified educators and transform your learning journey
          </p>
          
          {/* Advanced Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-xl">
              <div className="flex items-center">
                <div className="pl-4">
                  <Search className="text-white/80 w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search teachers, subjects, or specializations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-white/80 px-4 py-4 focus:outline-none text-lg font-medium"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl p-3 mr-2 group"
                >
                  <SlidersHorizontal className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-6 mb-8 transform transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Advanced Filters</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Board</label>
                <select
                  value={filterBoard}
                  onChange={(e) => setFilterBoard(e.target.value)}
                  className="w-full p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                >
                  <option value="">All Boards</option>
                  {uniqueBoards.map(board => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="fee-low">Price: Low to High</option>
                  <option value="fee-high">Price: High to Low</option>
                  <option value="students">Most Popular</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price Range (₹/hour)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-20 p-2 border border-gray-200 rounded-lg"
                    placeholder="Min"
                  />
                  <span className="text-slate-600">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                    className="w-20 p-2 border border-gray-200 rounded-lg"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {filteredAndSortedTeachers.length} Teachers Found
            </h2>
            {teachers.length === 0 && !loading && (
              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                No teachers are currently listed
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 rounded-xl transition-all duration-200 ${
                viewMode === "grid" 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                  : "bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 text-slate-700"
              }`}
            >
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 rounded-xl transition-all duration-200 ${
                viewMode === "list" 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                  : "bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/80 text-slate-700"
              }`}
            >
              <div className="space-y-1 w-4 h-4">
                <div className="bg-current h-1 rounded"></div>
                <div className="bg-current h-1 rounded"></div>
                <div className="bg-current h-1 rounded"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Teachers Grid/List */}
        <div className={`${viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}`}>
          {filteredAndSortedTeachers.map((teacher, index) => (
            <div
              key={teacher.id}
              className={`group bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-blue-200/60 transform hover:-translate-y-2 hover:scale-105 ${
                viewMode === "list" ? "flex" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`${viewMode === "list" ? "flex-shrink-0 w-48" : ""} relative`}>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-4xl">
                        {teacher.profilePicture ? (
                          <img 
                            src={teacher.profilePicture} 
                            alt={teacher.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                            {teacher.avatar}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {teacher.verified && (
                          <div className="bg-green-500 rounded-full p-1">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <button
                          onClick={() => toggleFavorite(teacher.id)}
                          className="hover:scale-110 transition-transform duration-200"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              favorites.includes(teacher.id)
                                ? "fill-red-500 text-red-500"
                                : "text-white/70 hover:text-white"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{teacher.name}</h3>
                    <p className="text-white/90 text-sm">{teacher.bio}</p>
                  </div>
                </div>

                {viewMode === "grid" && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-slate-800">{teacher.rating}</span>
                  </div>
                )}
              </div>

              <div className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className={`${viewMode === "list" ? "flex justify-between items-start" : ""}`}>
                  <div className={`${viewMode === "list" ? "flex-1 pr-6" : ""}`}>
                    {viewMode === "list" && (
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{teacher.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{teacher.rating}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{teacher.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Award className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">{teacher.board}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">{teacher.experience}y exp</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium">{teacher.totalStudents} students</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-slate-500 mb-2 font-semibold">Specializations</div>
                      <div className="flex flex-wrap gap-2">
                        {teacher.specializations.slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="bg-blue-50/80 backdrop-blur-sm text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200/40"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-slate-500 mb-2 font-semibold">Available Days</div>
                      <div className="flex space-x-1">
                        {teacher.availability.map((day, i) => (
                          <span
                            key={i}
                            className="bg-green-50/80 backdrop-blur-sm text-green-700 px-2 py-1 rounded-lg text-xs font-medium border border-green-200/40"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`${viewMode === "list" ? "text-right" : ""}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">{teacher.location}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800">₹{teacher.fee}</div>
                        <div className="text-xs text-slate-500 font-medium">per hour</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleBook(teacher)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 group"
                      >
                        <Calendar className="w-4 h-4 group-hover:animate-pulse" />
                        <span>Book Session</span>
                      </button>
                      
                      <button
                        onClick={() => handleMessage(teacher)}
                        className="w-full bg-white/60 backdrop-blur-sm border border-blue-200 hover:bg-blue-50/60 text-blue-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 group"
                      >
                        <MessageCircle className="w-4 h-4 group-hover:animate-pulse" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedTeachers.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👩‍🏫</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No teachers found</h3>
            <p className="text-gray-600 mb-4">
              {teachers.length === 0 
                ? "No teachers are currently listed. Be the first to register as a teacher!" 
                : "Try adjusting your search criteria"}
            </p>
            {teachers.length === 0 && (
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Become a Teacher
              </button>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Book Session</h3>
                    <p className="text-slate-600 text-sm">
                      with {selectedTeacher?.name} • {selectedTeacher?.subject}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white/60 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                  className="w-full p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Duration (hours)
                </label>
                <select
                  value={bookingForm.duration}
                  onChange={(e) => setBookingForm({...bookingForm, duration: e.target.value})}
                  className="w-full p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                >
                  <option value="1">1 hour</option>
                  <option value="1.5">1.5 hours</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                  placeholder="Any specific requirements or topics you'd like to focus on..."
                  rows={3}
                  className="w-full p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
                />
              </div>

              <div className="bg-blue-50/60 backdrop-blur-sm border border-blue-200/40 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">Session Fee:</span>
                  <span className="font-semibold text-slate-800">₹{selectedTeacher?.fee} × {bookingForm.duration}h</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold mt-2">
                  <span className="text-slate-800">Total:</span>
                  <span className="text-blue-600">
                    ₹{(selectedTeacher?.fee * parseFloat(bookingForm.duration)).toFixed(0)}
                  </span>
                </div>
              </div>

              <button
                onClick={submitBooking}
                disabled={!bookingForm.date || !bookingForm.time}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Confirm Booking</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}