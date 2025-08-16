import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Star, Clock, BookOpen, Award, ChevronDown, X, Check, Heart, MapPin, Calendar, DollarSign, Users, Zap, SlidersHorizontal, GraduationCap, Target, SearchX } from "lucide-react";

const mockTeachers = [
  {
    id: 1,
    name: "Anjali Sharma",
    subject: "Mathematics",
    board: "CBSE",
    experience: 5,
    fee: 400,
    rating: 4.8,
    totalStudents: 45,
    avatar: "AS",
    specializations: ["Algebra", "Calculus", "Geometry"],
    location: "Mumbai",
    availability: ["Mon", "Wed", "Fri"],
    bio: "Passionate mathematics teacher with innovative teaching methods",
    languages: ["English", "Hindi"],
    qualifications: ["M.Sc Mathematics", "B.Ed"],
    verified: true,
  },
  {
    id: 2,
    name: "Ravi Mehta",
    subject: "Physics",
    board: "ICSE",
    experience: 3,
    fee: 350,
    rating: 4.6,
    totalStudents: 32,
    avatar: "RM",
    specializations: ["Mechanics", "Optics", "Modern Physics"],
    location: "Delhi",
    availability: ["Tue", "Thu", "Sat"],
    bio: "Making physics fun and accessible for all students",
    languages: ["English", "Hindi", "Punjabi"],
    qualifications: ["M.Sc Physics", "B.Tech"],
    verified: true,
  },
  {
    id: 3,
    name: "Priya Patel",
    subject: "Chemistry",
    board: "CBSE",
    experience: 7,
    fee: 450,
    rating: 4.9,
    totalStudents: 67,
    avatar: "PP",
    specializations: ["Organic Chemistry", "Physical Chemistry", "Analytical Chemistry"],
    location: "Ahmedabad",
    availability: ["Mon", "Tue", "Thu"],
    bio: "Expert in making complex chemistry concepts simple and memorable",
    languages: ["English", "Hindi", "Gujarati"],
    qualifications: ["Ph.D Chemistry", "M.Sc Chemistry"],
    verified: true,
  },
  {
    id: 4,
    name: "Vikram Singh",
    subject: "Biology",
    board: "ICSE",
    experience: 4,
    fee: 380,
    rating: 4.7,
    totalStudents: 28,
    avatar: "VS",
    specializations: ["Botany", "Zoology", "Human Physiology"],
    location: "Bangalore",
    availability: ["Wed", "Fri", "Sun"],
    bio: "Bringing life sciences to life with practical examples",
    languages: ["English", "Hindi", "Kannada"],
    qualifications: ["M.Sc Biology", "B.Sc"],
    verified: true,
  },
  {
    id: 5,
    name: "Meera Reddy",
    subject: "English",
    board: "CBSE",
    experience: 6,
    fee: 320,
    rating: 4.8,
    totalStudents: 52,
    avatar: "MR",
    specializations: ["Literature", "Grammar", "Creative Writing"],
    location: "Hyderabad",
    availability: ["Mon", "Wed", "Sat"],
    bio: "Nurturing language skills and literary appreciation",
    languages: ["English", "Hindi", "Telugu"],
    qualifications: ["M.A English", "B.Ed"],
    verified: false,
  },
  {
    id: 6,
    name: "Amit Kumar",
    subject: "Computer Science",
    board: "CBSE",
    experience: 8,
    fee: 500,
    rating: 4.9,
    totalStudents: 89,
    avatar: "AK",
    specializations: ["Programming", "Data Structures", "Web Development"],
    location: "Pune",
    availability: ["Tue", "Thu", "Fri"],
    bio: "Coding mentor with industry experience and teaching passion",
    languages: ["English", "Hindi", "Marathi"],
    qualifications: ["M.Tech CSE", "B.Tech CSE"],
    verified: true,
  },
];

export default function EnhancedTeacherPlatform() {
  const [teachers, setTeachers] = useState(mockTeachers);
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

  const submitBooking = () => {
    const newBooking = {
      id: Date.now(),
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      subject: selectedTeacher.subject,
      date: bookingForm.date,
      time: bookingForm.time,
      duration: bookingForm.duration,
      message: bookingForm.message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setBookings([...bookings, newBooking]);
    setShowBookingModal(false);
    setBookingForm({ date: "", time: "", duration: "1", message: "" });
    setNotification(`Booking request sent to ${selectedTeacher.name}! 🎉`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delayed"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
      </div>
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
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <Target className="inline-block w-12 h-12 mr-4 mb-2" />
            Find Your Perfect Teacher
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Connect with exceptional educators and unlock your learning potential with personalized guidance
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
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-20 p-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Min"
                  />
                  <span className="text-slate-600">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-20 p-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800">
                {filteredAndSortedTeachers.length} Teachers Found
              </h2>
            </div>
            {bookings.length > 0 && (
              <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/40 rounded-xl px-4 py-2">
                <div className="text-sm font-medium text-blue-700">
                  {bookings.length} Active Bookings
                </div>
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
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                        <span className="text-2xl font-bold text-white">{teacher.avatar}</span>
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

                    <button
                      onClick={() => handleBook(teacher)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 group"
                    >
                      <Calendar className="w-4 h-4 group-hover:animate-pulse" />
                      <span>Book Session</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedTeachers.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl mb-4">
                <SearchX className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No teachers found</h3>
            <p className="text-slate-600">Try adjusting your search criteria or explore different subjects</p>
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
                  className="w-full p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
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