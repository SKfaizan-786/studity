// API service for booking operations
const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return user.token;
};

// Create API headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

export const bookingAPI = {
  // Get teacher bookings
  getTeacherBookings: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/bookings/teacher${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching bookings: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get student bookings
  getStudentBookings: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/bookings/student${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching bookings: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Create new booking
  createBooking: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error creating booking');
    }
    
    return response.json();
  },

  // Update booking status
  updateBookingStatus: async (bookingId, statusData) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(statusData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error updating booking status');
    }
    
    return response.json();
  },

  // Reschedule booking
  rescheduleBooking: async (bookingId, rescheduleData) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reschedule`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(rescheduleData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error rescheduling booking');
    }
    
    return response.json();
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching booking details: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get teacher availability
  getTeacherAvailability: async (teacherId, date) => {
    const response = await fetch(`${API_BASE_URL}/bookings/teacher/${teacherId}/availability?date=${date}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching availability: ${response.statusText}`);
    }
    
    return response.json();
  }
};
