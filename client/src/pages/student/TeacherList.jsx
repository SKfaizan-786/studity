import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Star, Clock, BookOpen, Award, ChevronDown, X, Check, Heart, MapPin, Calendar, DollarSign, Users, Zap, SlidersHorizontal } from "lucide-react";

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
    avatar: "👩‍🏫",
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
    avatar: "👨‍🔬",
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
    avatar: "👩‍🔬",
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
    avatar: "👨‍⚕️",
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
    avatar: "👩‍🎓",
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
    avatar: "👨‍💻",
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 animate-pulse">
          {notification}
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 animate-pulse">
            🌟 Premium Teacher Hub 🌟
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Discover exceptional educators and transform your learning journey
          </p>
          
          {/* Advanced Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
              <Search className="text-white/70 ml-4 w-5 h-5" />
              <input
                type="text"
                placeholder="Search teachers, subjects, or specializations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/70 px-4 py-3 focus:outline-none text-lg"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/20 hover:bg-white/30 transition-all duration-200 rounded-xl p-3 ml-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 transform transition-all duration-300">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Board</label>
                <select
                  value={filterBoard}
                  onChange={(e) => setFilterBoard(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Boards</option>
                  {uniqueBoards.map(board => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="fee-low">Price: Low to High</option>
                  <option value="fee-high">Price: High to Low</option>
                  <option value="students">Most Popular</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (₹/hour)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-20 p-2 border border-gray-200 rounded-lg"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
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
            <div className="text-sm text-gray-500">
              {bookings.length} Active Bookings
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
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
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
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
              className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2 ${
                viewMode === "list" ? "flex" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`${viewMode === "list" ? "flex-shrink-0 w-48" : ""} relative`}>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-4xl">{teacher.avatar}</div>
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
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{teacher.rating}</span>
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
                      <div className="flex items-center space-x-2 text-gray-600">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm">{teacher.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Award className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{teacher.board}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{teacher.experience}y exp</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{teacher.totalStudents} students</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Specializations</div>
                      <div className="flex flex-wrap gap-1">
                        {teacher.specializations.slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Available</div>
                      <div className="flex space-x-1">
                        {teacher.availability.map((day, i) => (
                          <span
                            key={i}
                            className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`${viewMode === "list" ? "text-right" : ""}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{teacher.location}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">₹{teacher.fee}</div>
                        <div className="text-xs text-gray-500">per hour</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBook(teacher)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 group"
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
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No teachers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Book Session</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">
                with {selectedTeacher?.name} • {selectedTeacher?.subject}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (hours)
                </label>
                <select
                  value={bookingForm.duration}
                  onChange={(e) => setBookingForm({...bookingForm, duration: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="1">1 hour</option>
                  <option value="1.5">1.5 hours</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                  placeholder="Any specific requirements or topics you'd like to focus on..."
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Session Fee:</span>
                  <span className="font-semibold">₹{selectedTeacher?.fee} × {bookingForm.duration}h</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold mt-2">
                  <span>Total:</span>
                  <span className="text-indigo-600">
                    ₹{(selectedTeacher?.fee * parseFloat(bookingForm.duration)).toFixed(0)}
                  </span>
                </div>
              </div>

              <button
                onClick={submitBooking}
                disabled={!bookingForm.date || !bookingForm.time}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2"
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