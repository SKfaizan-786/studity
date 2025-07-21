import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, CalendarDays, Clock, UserRound, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
// Import your storage utility functions
import { getFromLocalStorage, setToLocalStorage } from "../utils/storage";

// --- Mock Data Seeding (for demonstration) ---
// In a real application, this data would come from a backend API.
// This function ensures that mock data exists in localStorage for testing.
const seedLocalStorage = () => {
  if (!getFromLocalStorage('mockTeachers')) {
    const teachers = [
      { id: 1, name: "Alice Smith", subject: "Mathematics", bio: "Experienced math tutor with a passion for helping students excel.", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
      { id: 2, name: "Bob Johnson", subject: "Physics", bio: "Makes complex physics concepts easy to understand. Specializes in mechanics and electromagnetism.", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
      { id: 3, name: "Charlie Brown", subject: "English Literature", bio: "Enthusiastic about classic and contemporary literature, focusing on essay writing and comprehension.", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
      { id: 4, name: "Diana Prince", subject: "Computer Science", bio: "Expert in programming and algorithms, with a knack for debugging and problem-solving.", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
    ];
    setToLocalStorage('mockTeachers', teachers);
  }

  if (!getFromLocalStorage('mockAvailableSlots')) {
    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // Generate slots for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD

      // Assign slots to teachers with specific times
      // Teacher 1 (Mathematics)
      if (i % 2 === 0) { // Every other day
        slots.push({ id: `slot-1-${formattedDate}-9AM`, teacherId: 1, date: formattedDate, day: dayName, time: '09:00 AM', isBooked: false });
        slots.push({ id: `slot-1-${formattedDate}-2PM`, teacherId: 1, date: formattedDate, day: dayName, time: '02:00 PM', isBooked: false });
      }
      // Teacher 2 (Physics)
      if (i % 3 === 0) { // Every third day
        slots.push({ id: `slot-2-${formattedDate}-10AM`, teacherId: 2, date: formattedDate, day: dayName, time: '10:00 AM', isBooked: false });
        slots.push({ id: `slot-2-${formattedDate}-3PM`, teacherId: 2, date: formattedDate, day: dayName, time: '03:00 PM', isBooked: false });
      }
      // Teacher 3 (English Literature)
      if (i % 4 === 0) { // Every fourth day
        slots.push({ id: `slot-3-${formattedDate}-11AM`, teacherId: 3, date: formattedDate, day: dayName, time: '11:00 AM', isBooked: false });
      }
      // Teacher 4 (Computer Science)
      if (i % 5 === 0) { // Every fifth day
        slots.push({ id: `slot-4-${formattedDate}-1PM`, teacherId: 4, date: formattedDate, day: dayName, time: '01:00 PM', isBooked: false });
      }
    }
    setToLocalStorage('mockAvailableSlots', slots);
  }

  if (!getFromLocalStorage('studentBookings')) {
    setToLocalStorage('studentBookings', []);
  }
};
// --- End Mock Data Seeding ---


export default function BookClass() {
  const [teacher, setTeacher] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState(null); // 'success', 'error', null

  const navigate = useNavigate();
  const location = useLocation();
  const teacherId = new URLSearchParams(location.search).get("teacherId");

  // Effect to load teacher data and available slots
  useEffect(() => {
    seedLocalStorage(); // Ensure mock data exists for demonstration

    const fetchData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const teachers = getFromLocalStorage("mockTeachers") || [];
      const selected = teachers.find((t) => t.id === parseInt(teacherId));
      setTeacher(selected);

      if (selected) {
        const allSlots = getFromLocalStorage("mockAvailableSlots") || [];
        const filteredSlots = allSlots.filter(
          (slot) => slot.teacherId === selected.id && !slot.isBooked
        );
        setAvailableSlots(filteredSlots);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [teacherId]);

  const handleBook = async () => {
    if (!selectedSlotId) {
      setBookingStatus('error');
      setTimeout(() => setBookingStatus(null), 3000);
      return;
    }

    setIsLoading(true); // Show loading while booking
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate booking delay

    let studentBookings = getFromLocalStorage("studentBookings") || [];
    let allAvailableSlots = getFromLocalStorage("mockAvailableSlots") || [];

    const bookedSlot = allAvailableSlots.find(slot => slot.id === selectedSlotId);

    if (bookedSlot && !bookedSlot.isBooked) {
      // Mark the slot as booked
      const updatedAvailableSlots = allAvailableSlots.map(slot =>
        slot.id === selectedSlotId ? { ...slot, isBooked: true } : slot
      );
      setToLocalStorage("mockAvailableSlots", updatedAvailableSlots);

      // Add booking to student's record
      studentBookings.push({
        bookingId: `booking-${Date.now()}`,
        studentId: getFromLocalStorage("currentUser")?.id || "guest", // Assuming student ID exists
        slotId: selectedSlotId,
        teacherId: teacher.id,
        teacherName: teacher.name,
        subject: teacher.subject,
        date: bookedSlot.date,
        day: bookedSlot.day,
        time: bookedSlot.time,
        note,
        status: "pending", // Can be 'pending', 'confirmed', 'cancelled'
        bookedAt: new Date().toISOString(),
      });
      setToLocalStorage("studentBookings", studentBookings);

      setBookingStatus('success');
      setSelectedSlotId(""); // Reset selected slot
      setNote(""); // Clear note
      setAvailableSlots(availableSlots.filter(slot => slot.id !== selectedSlotId)); // Remove booked slot from list
      setTimeout(() => {
        setBookingStatus(null);
        navigate("/student/dashboard"); // Navigate to student dashboard or bookings page
      }, 2000); // Show success for 2 seconds before navigating
    } else {
      setBookingStatus('error');
      setTimeout(() => setBookingStatus(null), 3000);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 text-slate-700">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
        <p className="text-xl font-semibold">Loading available slots...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-xl font-bold text-gray-800 text-center">Teacher not found. Please go back to the teacher list.</p>
        <button
          onClick={() => navigate("/teachers")} // Assuming you have a route to list teachers
          className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Browse Teachers
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 p-8 flex justify-center items-center font-sans">
      <div className="relative bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-white/50 animate-fade-in-up">

        {/* Booking Status Message */}
        {bookingStatus === 'success' && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 bg-emerald-500 text-white py-3 px-6 rounded-lg shadow-xl flex items-center justify-center space-x-3 animate-slide-down z-20">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">Class booked successfully!</span>
          </div>
        )}
        {bookingStatus === 'error' && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 bg-red-500 text-white py-3 px-6 rounded-lg shadow-xl flex items-center justify-center space-x-3 animate-slide-down z-20">
            <AlertCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">Booking failed. Please select a slot.</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8 border-b pb-6 border-indigo-100">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-400 shadow-lg flex-shrink-0 mb-4 md:mb-0">
            <img src={teacher.avatar || `https://via.placeholder.com/150/9CA3AF/FFFFFF?text=${teacher.name.charAt(0)}`} alt={teacher.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Book a Class with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{teacher.name}</span></h2>
            <p className="text-xl text-gray-600 mb-2 flex items-center justify-center md:justify-start gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" /> Subject: {teacher.subject}
            </p>
            <p className="text-md text-gray-500 leading-relaxed max-w-prose">{teacher.bio}</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-indigo-500" />
          Select an Available Slot
        </h3>

        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {availableSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 shadow-md transform hover:scale-[1.02]
                  ${selectedSlotId === slot.id
                    ? "border-purple-500 bg-purple-50 text-purple-800 ring-4 ring-purple-200"
                    : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <CalendarDays className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="font-semibold text-lg">{slot.day}, {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {slot.time}
                    </p>
                  </div>
                </div>
                {selectedSlotId === slot.id && <CheckCircle className="w-6 h-6 text-purple-600 animate-fade-in" />}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            No available slots for this teacher at the moment. Please check back later!
          </p>
        )}

        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <UserRound className="w-6 h-6 text-indigo-500" />
          Add a Note (Optional)
        </h3>
        <textarea
          className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 text-gray-800 placeholder-gray-400 resize-y min-h-[100px] mb-8"
          placeholder="e.g., 'I need help with quadratic equations.' or 'Can we focus on past paper questions?'"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          disabled={!selectedSlotId || isLoading}
          onClick={handleBook}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg
            ${!selectedSlotId || isLoading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.01]"
            }`}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <CheckCircle className="w-6 h-6" />
          )}
          <span>{isLoading ? "Booking..." : "Confirm Booking"}</span>
        </button>

        <button
          onClick={() => navigate(-1)} // Go back to the previous page (e.g., teacher list)
          className="mt-4 w-full py-3 text-purple-600 font-semibold rounded-xl border border-purple-300 hover:bg-purple-50 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>Back to Teacher List</span>
        </button>
      </div>

      {/* Tailwind CSS Custom Scrollbar and Animation Definitions */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #a78bfa; /* purple-400 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8b5cf6; /* purple-500 */
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.4s ease-out forwards;
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