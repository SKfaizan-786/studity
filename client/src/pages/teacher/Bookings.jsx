import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, CalendarDays, Clock, User, BookOpen, DollarSign, Filter, 
  Search, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare,
  ChevronLeft, ChevronRight, Download, RefreshCw, Users, MapPin,
  Phone, Mail, GraduationCap, Loader2, Plus, Edit, Trash2
} from 'lucide-react';

// Import storage utilities
import { getFromLocalStorage, setToLocalStorage } from '../utils/storage';
import { bookingAPI } from '../../services/bookingAPI';

// Booking status configurations
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed', 
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
};

const STATUS_CONFIG = {
  [BOOKING_STATUS.PENDING]: {
    color: 'bg-amber-500',
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertCircle
  },
  [BOOKING_STATUS.CONFIRMED]: {
    color: 'bg-emerald-500',
    textColor: 'text-emerald-800', 
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle
  },
  [BOOKING_STATUS.COMPLETED]: {
    color: 'bg-blue-500',
    textColor: 'text-blue-800',
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    icon: CheckCircle
  },
  [BOOKING_STATUS.CANCELLED]: {
    color: 'bg-red-500',
    textColor: 'text-red-800',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200', 
    icon: XCircle
  },
  [BOOKING_STATUS.RESCHEDULED]: {
    color: 'bg-purple-500',
    textColor: 'text-purple-800',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Calendar
  }
};

export default function TeacherBookings() {
  const navigate = useNavigate();
  
  // State management
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  const ITEMS_PER_PAGE = 10;

  // Initialize component
  useEffect(() => {
    initializeBookings();
  }, []);

  const initializeBookings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = getFromLocalStorage('currentUser');
      if (!user || user.role !== 'teacher') {
        navigate('/login');
        return;
      }
      setCurrentUser(user);

      // Fetch bookings from API
      try {
        const response = await bookingAPI.getTeacherBookings({
          page: 1,
          limit: 100 // Get all bookings for now
        });
        
        setBookings(response.bookings || []);
        updateStats(response.bookings || []);
        
        // Update stats from API response if available
        if (response.stats) {
          setStats(response.stats);
        }
      } catch (apiError) {
        console.error('Error fetching bookings from API:', apiError);
        // Fallback to empty array if API fails
        setBookings([]);
        updateStats([]);
      }
      
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Update statistics
  const updateStats = (bookingList) => {
    const stats = {
      total: bookingList.length,
      pending: bookingList.filter(b => b.status === BOOKING_STATUS.PENDING).length,
      confirmed: bookingList.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length,
      completed: bookingList.filter(b => b.status === BOOKING_STATUS.COMPLETED).length,
      cancelled: bookingList.filter(b => b.status === BOOKING_STATUS.CANCELLED).length
    };
    setStats(stats);
  };

  // Filter and search bookings
  useEffect(() => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Apply date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.date);
        switch (dateFilter) {
          case 'today':
            return bookingDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return bookingDate >= weekAgo && bookingDate <= now;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return bookingDate >= monthAgo && bookingDate <= now;
          default:
            return true;
        }
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    setFilteredBookings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  // Handle booking status change
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // Update status via API
      await bookingAPI.updateBookingStatus(bookingId, { 
        status: newStatus,
        meetingLink: newStatus === 'confirmed' ? 'https://meet.google.com/new' : undefined
      });

      // Update local state
      const updatedBookings = bookings.map(booking =>
        (booking.id === bookingId || booking._id === bookingId) 
          ? { ...booking, status: newStatus } 
          : booking
      );
      setBookings(updatedBookings);
      updateStats(updatedBookings);
      
      console.log(`Booking ${bookingId} status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert(`Error updating booking status: ${error.message}`);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="flex items-center space-x-3 text-purple-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xl font-medium">Loading bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400 flex items-center gap-3">
              <Calendar className="w-10 h-10 text-purple-400" />
              My Bookings
            </h1>
            <p className="text-gray-400 mt-2">Manage your student sessions and appointments</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => initializeBookings()}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          <div className="bg-gray-800/60 backdrop-blur-xl p-4 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-amber-500/10 backdrop-blur-xl p-4 rounded-xl border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-300">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          
          <div className="bg-emerald-500/10 backdrop-blur-xl p-4 rounded-xl border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-emerald-300">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          
          <div className="bg-blue-500/10 backdrop-blur-xl p-4 rounded-xl border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-blue-300">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-red-500/10 backdrop-blur-xl p-4 rounded-xl border border-red-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">Cancelled</p>
                <p className="text-2xl font-bold text-red-300">{stats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gray-800/60 backdrop-blur-xl p-6 rounded-xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students, subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value={BOOKING_STATUS.PENDING}>Pending</option>
              <option value={BOOKING_STATUS.CONFIRMED}>Confirmed</option>
              <option value={BOOKING_STATUS.COMPLETED}>Completed</option>
              <option value={BOOKING_STATUS.CANCELLED}>Cancelled</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-gray-400">
              <Filter className="w-4 h-4 mr-2" />
              <span>{filteredBookings.length} results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="max-w-7xl mx-auto">
        {currentBookings.length === 0 ? (
          <div className="bg-gray-800/60 backdrop-blur-xl p-12 rounded-xl border border-gray-700 text-center">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">
              {bookings.length === 0 
                ? "You haven't received any booking requests yet. Students will be able to book sessions with you once you're listed."
                : "No bookings match your current filters. Try adjusting your search criteria."
              }
            </p>
            {bookings.length === 0 && (
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentBookings.map((booking) => (
              <BookingCard
                key={booking._id || booking.id}
                booking={booking}
                onStatusChange={handleStatusChange}
                onViewDetails={(booking) => {
                  setSelectedBooking(booking);
                  setShowDetails(true);
                }}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setShowDetails(false)}
          onStatusChange={handleStatusChange}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

// Booking Card Component
function BookingCard({ booking, onStatusChange, onViewDetails, formatDate, formatCurrency }) {
  const statusConfig = STATUS_CONFIG[booking.status];
  const StatusIcon = statusConfig.icon;
  const bookingId = booking._id || booking.id;

  return (
    <div className="bg-gray-800/60 backdrop-blur-xl p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                {booking.student.name}
              </h3>
              <p className="text-gray-400 text-sm">{booking.student.email}</p>
            </div>
            
            <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <StatusIcon className={`w-4 h-4 ${statusConfig.color.replace('bg-', 'text-')}`} />
              <span className={`text-sm font-medium capitalize ${statusConfig.textColor}`}>
                {booking.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>{booking.subject}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <CalendarDays className="w-4 h-4 text-green-400" />
              <span>{formatDate(booking.date)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>{booking.time} ({booking.duration}h)</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-300">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>{formatCurrency(booking.amount)}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-gray-300 text-sm">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 lg:min-w-[200px]">
          <button
            onClick={() => onViewDetails(booking)}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Details
          </button>

          {booking.status === BOOKING_STATUS.PENDING && (
            <div className="flex gap-2">
              <button
                onClick={() => onStatusChange(bookingId, BOOKING_STATUS.CONFIRMED)}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={() => onStatusChange(bookingId, BOOKING_STATUS.CANCELLED)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}

          {booking.status === BOOKING_STATUS.CONFIRMED && booking.meetingLink && (
            <a
              href={booking.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Join
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Booking Details Modal Component
function BookingDetailsModal({ booking, onClose, onStatusChange, formatDate, formatCurrency }) {
  const statusConfig = STATUS_CONFIG[booking.status];
  const StatusIcon = statusConfig.icon;
  const bookingId = booking._id || booking.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Booking Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Status</span>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.color.replace('bg-', 'text-')}`} />
              <span className={`font-medium capitalize ${statusConfig.textColor}`}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Student Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Student Information
            </h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>{booking.student.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-400" />
                <span>{booking.student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400" />
                <span>{booking.student.phone}</span>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Session Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>
                <span className="text-gray-400 block text-sm">Subject</span>
                <span className="font-medium">{booking.subject}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-sm">Date</span>
                <span className="font-medium">{formatDate(booking.date)}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-sm">Time</span>
                <span className="font-medium">{booking.time}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-sm">Duration</span>
                <span className="font-medium">{booking.duration} hours</span>
              </div>
              <div>
                <span className="text-gray-400 block text-sm">Amount</span>
                <span className="font-medium text-emerald-400">{formatCurrency(booking.amount)}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-sm">Booked On</span>
                <span className="font-medium">{formatDate(booking.createdAt || booking.date)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-gray-300">{booking.notes}</p>
              </div>
            </div>
          )}

          {/* Meeting Link */}
          {booking.meetingLink && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Meeting Link</h3>
              <a
                href={booking.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline break-all"
              >
                {booking.meetingLink}
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            {booking.status === BOOKING_STATUS.PENDING && (
              <>
                <button
                  onClick={() => {
                    onStatusChange(bookingId, BOOKING_STATUS.CONFIRMED);
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Accept Booking
                </button>
                <button
                  onClick={() => {
                    onStatusChange(bookingId, BOOKING_STATUS.CANCELLED);
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Booking
                </button>
              </>
            )}

            {booking.status === BOOKING_STATUS.CONFIRMED && (
              <>
                {booking.meetingLink && (
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Join Meeting
                  </a>
                )}
                <button
                  onClick={() => {
                    onStatusChange(bookingId, BOOKING_STATUS.COMPLETED);
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Complete
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
