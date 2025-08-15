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
  Home,
  DollarSign,
  Star,
  Users
} from 'lucide-react';
import { getFromLocalStorage, setToLocalStorage } from '../utils/storage';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getFromLocalStorage('currentUser');
    if (!user || user.role !== 'teacher') {
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

  const handleNestedInputChange = (parentField, field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
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

  const teacherData = currentUser.teacherProfileData || {};

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
            to="/teacher/dashboard"
            className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white/80 transition-all duration-200 shadow-sm text-slate-700 hover:text-blue-600 group"
          >
            <Home className="w-5 h-5 transition-colors duration-200 group-hover:text-blue-600" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
            <p className="text-slate-600">View and manage your teaching profile</p>
          </div>

          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Profile Card */}
        <div className="max-w-6xl mx-auto">
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
                      {teacherData.firstName || currentUser.firstName} {teacherData.lastName || currentUser.lastName}
                    </h2>
                    <p className="text-blue-100">Teacher</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{currentUser.email}</span>
                    </div>
                    {teacherData.isListed && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm">Listed Teacher</span>
                      </div>
                    )}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Personal Information</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.teacherProfileData?.firstName || editedProfile.firstName || ''}
                          onChange={(e) => handleNestedInputChange('teacherProfileData', 'firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">
                          {teacherData.firstName || currentUser.firstName || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.teacherProfileData?.lastName || editedProfile.lastName || ''}
                          onChange={(e) => handleNestedInputChange('teacherProfileData', 'lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">
                          {teacherData.lastName || currentUser.lastName || 'Not provided'}
                        </p>
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
                          value={editedProfile.teacherProfileData?.phone || ''}
                          onChange={(e) => handleNestedInputChange('teacherProfileData', 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">
                          {teacherData.phone || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                      {isEditing ? (
                        <textarea
                          value={editedProfile.teacherProfileData?.bio || ''}
                          onChange={(e) => handleNestedInputChange('teacherProfileData', 'bio', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="4"
                          placeholder="Tell students about yourself..."
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg min-h-[100px]">
                          {teacherData.bio || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Teaching Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <span>Teaching Information</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Subjects Taught</label>
                      {isEditing ? (
                        <textarea
                          value={editedProfile.teacherProfileData?.subjects || ''}
                          onChange={(e) => handleNestedInputChange('teacherProfileData', 'subjects', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="e.g., Mathematics, Physics, Chemistry..."
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg min-h-[80px]">
                          {teacherData.subjects || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Experience (years)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedProfile.teacherProfileData?.experience || ''}
                          onChange={(e) => handleNestedInputChange('teacherProfileData', 'experience', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Years of teaching experience"
                          min="0"
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">
                          {teacherData.experience ? `${teacherData.experience} years` : 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate ($)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedProfile.teacherProfileData?.hourlyRate || ''}
                          onChange={(e) => handleNestedInputChange('teacherProfileData', 'hourlyRate', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter hourly rate"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">
                          {teacherData.hourlyRate ? `$${teacherData.hourlyRate}/hour` : 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Education</label>
                      {isEditing ? (
                        <textarea
                          value={editedProfile.teacherProfileData?.education || ''}
                          onChange={(e) => handleNestedInputChange('teacherProfileData', 'education', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Your educational background..."
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg min-h-[80px]">
                          {teacherData.education || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Certifications</label>
                      {isEditing ? (
                        <textarea
                          value={editedProfile.teacherProfileData?.certifications || ''}
                          onChange={(e) => handleNestedInputChange('teacherProfileData', 'certifications', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Teaching certifications and qualifications..."
                        />
                      ) : (
                        <p className="text-slate-900 bg-slate-50 px-3 py-2 rounded-lg min-h-[80px]">
                          {teacherData.certifications || 'Not provided'}
                        </p>
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
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <Star className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Listing Status</span>
                    </div>
                    <p className="text-purple-700 mt-1">
                      {teacherData.isListed ? 'Listed' : 'Not Listed'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Role</span>
                    </div>
                    <p className="text-orange-700 mt-1 capitalize">{currentUser.role}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/teacher/profile-setup"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                  <span>Update Profile Setup</span>
                </Link>
                <Link
                  to="/teacher/schedule"
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <Clock className="w-4 h-4" />
                  <span>Manage Schedule</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
