import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, CalendarDays, Clock, UserRound, BookOpen, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
// Import your storage utility functions
import { getFromLocalStorage, setToLocalStorage } from "../utils/storage";
import { bookingAPI } from "../../services/bookingAPI";

export default function BookClass() {
  const [teacher, setTeacher] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [subject, setSubject] = useState("Mathematics");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const teacherId = new URLSearchParams(location.search).get("teacherId");

  // Get available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-IN', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return dates;
  };

  // Load teacher availability when date changes
  useEffect(() => {
    const loadAvailability = async () => {
      if (!teacherId || !selectedDate) return;

      try {
        const response = await bookingAPI.getTeacherAvailability(teacherId, selectedDate);
        setAvailableSlots(response.availableSlots || []);
      } catch (error) {
        console.error('Error loading availability:', error);
        setAvailableSlots([]);
      }
    };

    loadAvailability();
  }, [teacherId, selectedDate]);

  // Effect to load teacher data
  useEffect(() => {
    const fetchTeacherData = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const currentUser = getFromLocalStorage('currentUser');
        if (!currentUser || currentUser.role !== 'student') {
          navigate('/login');
          return;
        }

        if (!teacherId) {
          setIsLoading(false);
          return;
        }

        // Try to fetch from API first, then fallback to localStorage
        let teacherData = null;
        
        try {
          const response = await fetch(`/api/teachers/${teacherId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            teacherData = await response.json();
          }
        } catch (apiError) {
          console.log('API not available, trying localStorage...');
        }

        // Fallback to localStorage
        if (!teacherData) {
          const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
          teacherData = allUsers.find(user => 
            (user._id === teacherId || user.id === teacherId) && 
            user.role === 'teacher'
          );
        }

        if (teacherData) {
          // Format teacher data consistently
          const formattedTeacher = {
            id: teacherData._id || teacherData.id,
            name: teacherData.firstName && teacherData.lastName 
              ? `${teacherData.firstName} ${teacherData.lastName}` 
              : teacherData.name || 'Teacher',
            subject: teacherData.teacherProfile?.subjectsTaught?.[0] || 
                    teacherData.teacherProfile?.subjects?.[0] || 
                    'Multiple Subjects',
            bio: teacherData.teacherProfile?.bio || 
                 teacherData.bio || 
                 'Experienced educator with expertise in various subjects.',
            hourlyRate: teacherData.teacherProfile?.hourlyRate || 
                       teacherData.hourlyRate || 800,
            avatar: teacherData.teacherProfile?.profilePicture || 
                   teacherData.avatar || 
                   `https://via.placeholder.com/150/9CA3AF/FFFFFF?text=${(teacherData.firstName || teacherData.name || 'T').charAt(0)}`
          };
          
          setTeacher(formattedTeacher);
        }

        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);

      } catch (error) {
        console.error('Error loading teacher data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [teacherId, navigate]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !subject) {
      setErrorMessage("Please fill in all required fields");
      setBookingStatus('error');
      setTimeout(() => setBookingStatus(null), 3000);
      return;
    }

    setIsBooking(true);
    
    try {
      const bookingData = {
        teacherId,
        subject,
        date: selectedDate,
        time: selectedTime,
        duration: parseFloat(duration),
        notes: notes.trim()
      };

      await bookingAPI.createBooking(bookingData);
      
      setBookingStatus('success');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error creating booking:', error);
      setErrorMessage(error.message || 'Failed to create booking');
      setBookingStatus('error');
      setTimeout(() => setBookingStatus(null), 3000);
    } finally {
      setIsBooking(false);
    }
  };

  const calculateAmount = () => {
    const hourlyRate = teacher?.hourlyRate || 800;
    return hourlyRate * duration;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 text-slate-700">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
        <p className="text-xl font-semibold">Loading teacher information...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-xl font-bold text-gray-800 text-center">Teacher not found. Please go back to the teacher list.</p>
        <button
          onClick={() => navigate("/student/dashboard")}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 p-8 flex justify-center items-center font-sans">
      <div className="relative bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-white/50">

        {/* Booking Status Messages */}
        {bookingStatus === 'success' && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 bg-emerald-500 text-white py-3 px-6 rounded-lg shadow-xl flex items-center justify-center space-x-3 z-20">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">Class booked successfully!</span>
          </div>
        )}
        {bookingStatus === 'error' && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 bg-red-500 text-white py-3 px-6 rounded-lg shadow-xl flex items-center justify-center space-x-3 z-20">
            <AlertCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">{errorMessage || 'Booking failed. Please try again.'}</span>
          </div>
        )}

        {/* Teacher Info */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8 border-b pb-6 border-indigo-100">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-400 shadow-lg flex-shrink-0 mb-4 md:mb-0">
            <img 
              src={teacher.avatar || `https://via.placeholder.com/150/9CA3AF/FFFFFF?text=${teacher.name.charAt(0)}`} 
              alt={teacher.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
              Book a Class with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{teacher.name}</span>
            </h2>
            <p className="text-xl text-gray-600 mb-2 flex items-center justify-center md:justify-start gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" /> Subject: {teacher.subject}
            </p>
            <p className="text-lg text-emerald-600 mb-2 flex items-center justify-center md:justify-start gap-2">
              <DollarSign className="w-5 h-5" /> ₹{teacher.hourlyRate}/hour
            </p>
            <p className="text-md text-gray-500 leading-relaxed max-w-prose">{teacher.bio}</p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="space-y-6">
          {/* Subject Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="English">English</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">Select Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300"
            >
              <option value="">Choose a date</option>
              {getAvailableDates().map(date => (
                <option key={date.value} value={date.value}>{date.label}</option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">Available Times</label>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedTime === time
                          ? "border-purple-500 bg-purple-50 text-purple-800"
                          : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
                  No available slots for this date
                </p>
              )}
            </div>
          )}

          {/* Duration Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300"
            >
              <option value={1}>1 hour</option>
              <option value={1.5}>1.5 hours</option>
              <option value={2}>2 hours</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 resize-y min-h-[100px]"
              placeholder="Any specific topics you'd like to focus on?"
            />
          </div>

          {/* Total Amount */}
          {duration && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                <span className="text-2xl font-bold text-purple-600">₹{calculateAmount()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {duration} hour{duration > 1 ? 's' : ''} × ₹{teacher.hourlyRate}/hour
              </p>
            </div>
          )}

          {/* Book Button */}
          <button
            disabled={!selectedDate || !selectedTime || !subject || isBooking}
            onClick={handleBooking}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg ${
              !selectedDate || !selectedTime || !subject || isBooking
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.01]"
            }`}
          >
            {isBooking ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <CheckCircle className="w-6 h-6" />
            )}
            <span>{isBooking ? "Booking..." : "Confirm Booking"}</span>
          </button>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 text-purple-600 font-semibold rounded-xl border border-purple-300 hover:bg-purple-50 transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}