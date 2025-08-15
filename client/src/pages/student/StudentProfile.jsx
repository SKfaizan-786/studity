import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  Home
} from 'lucide-react';
import { getFromLocalStorage, setToLocalStorage } from '../utils/storage';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getFromLocalStorage('currentUser');
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    setEditedProfile(user);
    setLoading(false);
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Update localStorage with edited profile
    setToLocalStorage('currentUser', editedProfile);
    setCurrentUser(editedProfile);
    setIsEditing(false);
    // In a real app, you'd also send this to your backend API
  };

  const handleCancel = () => {
    setEditedProfile(currentUser);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delayed"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/student/dashboard"
            className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white/80 transition-all duration-200 shadow-sm text-slate-700 hover:text-blue-600 group"
          >
            <Home className="w-5 h-5 transition-colors duration-200 group-hover:text-blue-600" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600">View and manage your account information</p>
          </div>

          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Profile Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {currentUser.firstName} {currentUser.lastName}
                    </h2>
                    <p className="text-blue-100">Student</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{currentUser.email}</span>
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Personal Information</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.firstName || ''}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{currentUser.firstName || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.lastName || ''}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{currentUser.lastName || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{currentUser.email}</p>
                      <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedProfile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{currentUser.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <span>Academic Information</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
                      {isEditing ? (
                        <select
                          value={editedProfile.gradeLevel || ''}
                          onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Grade Level</option>
                          <option value="elementary">Elementary (K-5)</option>
                          <option value="middle">Middle School (6-8)</option>
                          <option value="high">High School (9-12)</option>
                          <option value="college">College/University</option>
                          <option value="adult">Adult Education</option>
                        </select>
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">{currentUser.gradeLevel || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Subjects of Interest</label>
                      {isEditing ? (
                        <textarea
                          value={editedProfile.subjectsOfInterest || ''}
                          onChange={(e) => handleInputChange('subjectsOfInterest', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="e.g., Mathematics, Science, English, History..."
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg min-h-[80px]">{currentUser.subjectsOfInterest || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Learning Goals</label>
                      {isEditing ? (
                        <textarea
                          value={editedProfile.learningGoals || ''}
                          onChange={(e) => handleInputChange('learningGoals', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="What are your learning objectives?"
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg min-h-[80px]">{currentUser.learningGoals || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2 mb-4">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>Account Status</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800">Profile Status</span>
                    </div>
                    <p className="text-green-700 mt-1">
                      {currentUser.profileComplete ? 'Complete' : 'Incomplete'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Member Since</span>
                    </div>
                    <p className="text-blue-700 mt-1">
                      {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Role</span>
                    </div>
                    <p className="text-purple-700 mt-1 capitalize">{currentUser.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
