import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Save, Phone, BookOpenCheck, MapPin, School, GraduationCap, UserCircle2, Check, X, Eye, EyeOff, Star, Camera, Trash2, Edit3, Loader2, Info, CheckCircle
} from 'lucide-react';

// --- IMPORT THE STORAGE UTILITIES ---
import { setToLocalStorage, getFromLocalStorage } from '../utils/storage';

const StudentProfileForm = () => {
  const navigate = useNavigate();

  // State to hold the form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    learningInterest: '',
    location: '',
    mode: '',
    board: '',
    subject: '',
    photo: null, // Stores File object
    bio: '',
    goals: []
  });

  // State to manage UI specific aspects
  const [uiState, setUiState] = useState({
    errors: {},
    isSubmitting: false,
    showPreview: false, // Not explicitly used but kept for potential future use
    currentStep: 0,
    photoPreviewUrl: null, // Stores base64 URL for image preview
    savedDataTimestamp: null, // To indicate auto-save time
    goalInput: '', // Input for adding new goals
    userLoaded: false, // Indicates if user data from localStorage has been loaded
    message: '', // For general messages (success, error)
    messageType: '', // 'success' | 'error'
    isSaving: false, // New state for auto-save visual feedback
  });

  const fileInputRef = useRef(null);

  // --- Derived State & Constants ---
  const steps = useMemo(() => [
    { title: 'Contact & Location', fields: ['phone', 'location'], icon: Phone },
    { title: 'Learning Preferences', fields: ['learningInterest', 'mode', 'board', 'subject'], icon: BookOpenCheck },
    { title: 'More About You', fields: ['bio', 'goals', 'photo'], icon: Edit3 }
  ], []); // Memoize steps array

  // Define required fields for each step
  const stepRequiredFields = useMemo(() => ({
    0: ['location'], // Phone is now optional
    1: ['learningInterest', 'mode', 'board', 'subject'],
    2: [] // Bio, goals, photo are optional
  }), []);

  const currentStepFields = steps[uiState.currentStep]?.fields || [];

  // Refined isStepComplete to truly check required fields for the current step
  const isStepComplete = useCallback(() => {
    const requiredFieldsForCurrentStep = stepRequiredFields[uiState.currentStep] || [];
    const currentStepHasErrors = requiredFieldsForCurrentStep.some(field => {
      const value = formData[field];
      // Check for empty string or null/undefined, AND if validateField reports an error
      return !value?.trim() || !!uiState.errors[field];
    });
    return !currentStepHasErrors;
  }, [formData, uiState.currentStep, uiState.errors, stepRequiredFields]);

  const progress = ((uiState.currentStep + 1) / steps.length) * 100;

  // --- Message/Toast Management ---
  const showMessage = useCallback((text, type = 'info', duration = 3000) => {
    setUiState(prev => ({ ...prev, message: text, messageType: type }));
    setTimeout(() => {
      setUiState(prev => ({ ...prev, message: '', messageType: '' }));
    }, duration);
  }, []);

  // --- Effects ---

  // Effect to load user data from localStorage on component mount
  useEffect(() => {
    // --- REPLACED localStorage.getItem with getFromLocalStorage ---
    const storedUser = getFromLocalStorage('currentUser', null);
    if (storedUser && storedUser.role === 'student') {
      const studentProfileData = storedUser.studentProfileData || {};

      setFormData(prev => ({
        ...prev,
        firstName: storedUser.firstName || '',
        lastName: storedUser.lastName || '',
        email: storedUser.email || '',
        phone: studentProfileData.phone || '',
        learningInterest: studentProfileData.learningInterest || '',
        location: studentProfileData.location || '',
        mode: studentProfileData.mode || '',
        board: studentProfileData.board || '',
        subject: studentProfileData.subject || '',
        bio: studentProfileData.bio || '',
        goals: studentProfileData.goals || [],
      }));

      if (studentProfileData.photoPreviewUrl) {
        setUiState(prev => ({
          ...prev,
          photoPreviewUrl: studentProfileData.photoPreviewUrl
        }));
      }
    }
    setUiState(prev => ({ ...prev, userLoaded: true }));
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!uiState.userLoaded) return; // Don't auto-save before user data is loaded

    setUiState(prev => ({ ...prev, isSaving: true })); // Indicate saving in progress

    const timeoutId = setTimeout(() => {
      // --- REPLACED localStorage.getItem with getFromLocalStorage ---
      const storedUser = getFromLocalStorage('currentUser', null);
      if (storedUser && storedUser.role === 'student') {
        const dataToSave = { ...formData };
        if (uiState.photoPreviewUrl) {
            dataToSave.photoPreviewUrl = uiState.photoPreviewUrl;
        } else {
            delete dataToSave.photoPreviewUrl;
        }
        delete dataToSave.photo; // Remove the File object

        const updatedUser = {
          ...storedUser,
          studentProfileData: {
            ...storedUser.studentProfileData,
            ...dataToSave
          }
        };
        // --- REPLACED localStorage.setItem with setToLocalStorage ---
        setToLocalStorage('currentUser', updatedUser);
        setUiState(prev => ({ ...prev, savedDataTimestamp: new Date().toLocaleTimeString(), isSaving: false }));
      }
    }, 2000); // Debounce auto-save by 2 seconds

    return () => {
      clearTimeout(timeoutId);
      setUiState(prev => ({ ...prev, isSaving: false })); // Clear saving indicator if effect cleans up
    };
  }, [formData, uiState.userLoaded, uiState.photoPreviewUrl]); // Depend on formData and photoPreviewUrl


  // --- Validation ---
  const validateField = useCallback((name, value) => {
    let error = '';
    // Determine if the field is required based on the current step's required fields.
    const isRequired = stepRequiredFields[uiState.currentStep]?.includes(name);

    switch (name) {
      case 'phone':
        if (value && !/^\+?[\d\s-()]{10,}$/.test(value)) {
          error = 'Please enter a valid phone number (min 10 digits).';
        }
        break;
      case 'learningInterest':
      case 'location':
      case 'mode':
      case 'board':
      case 'subject':
        if (isRequired && (!value || value.trim().length === 0)) {
          error = `This field is required.`;
        } else if (value && value.trim().length < 2) {
          error = `Please enter a valid ${name.replace(/([A-Z])/g, ' $1').toLowerCase()}.`;
        }
        break;
      case 'bio':
      case 'goals':
      case 'photo':
        // These fields are optional and don't have direct format validation here
        break;
      default:
        break;
    }
    setUiState(prev => ({ ...prev, errors: { ...prev.errors, [name]: error } }));
    return error === '';
  }, [uiState.currentStep, stepRequiredFields]);


  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;

    if (name === 'photo' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, photo: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setUiState(prev => ({ ...prev, photoPreviewUrl: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else if (name === 'goalInput') {
      setUiState(prev => ({ ...prev, goalInput: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Validate on change for immediate feedback (debouncing can be added here if performance is an issue)
      validateField(name, value);
    }
  }, [validateField]);

  const addGoal = useCallback(() => {
    if (uiState.goalInput.trim()) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, { id: Date.now(), text: uiState.goalInput.trim() }]
      }));
      setUiState(prev => ({ ...prev, goalInput: '' }));
    }
  }, [uiState.goalInput]);

  const removeGoal = useCallback((id) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== id)
    }));
  }, []);

  const removePhoto = useCallback(() => {
    setFormData(prev => ({ ...prev, photo: null }));
    setUiState(prev => ({ ...prev, photoPreviewUrl: null }));
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    let formHasErrors = false;

    // Validate all required fields across all steps
    // Flatten all required fields from all steps for final validation
    const allRequiredFields = Object.values(stepRequiredFields).flat();

    allRequiredFields.forEach(field => {
      const hasError = !validateField(field, formData[field]);
      if (hasError) formHasErrors = true;
    });

    // Also check for any existing errors set by previous validations that might not be on the current step's required list
    if (Object.values(uiState.errors).some(error => error !== '')) {
        formHasErrors = true;
    }

    if (formHasErrors) {
      showMessage('Please fix the errors in your form before submitting.', 'error');
      setUiState(prev => ({ ...prev, isSubmitting: false }));
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // --- REPLACED localStorage.getItem with getFromLocalStorage ---
      const storedUser = getFromLocalStorage('currentUser', null);
      if (storedUser && storedUser.role === 'student') {
        const dataToSave = { ...formData };
        if (uiState.photoPreviewUrl) {
            dataToSave.photoPreviewUrl = uiState.photoPreviewUrl;
        } else {
            delete dataToSave.photoPreviewUrl;
        }
        delete dataToSave.photo;

        const updatedUser = {
          ...storedUser,
          profileComplete: true,
          studentProfileData: dataToSave
        };
        // --- REPLACED localStorage.setItem with setToLocalStorage ---
        setToLocalStorage('currentUser', updatedUser);

        // --- REPLACED localStorage.getItem with getFromLocalStorage ---
        const allUsers = getFromLocalStorage('registeredUsers', []);
        // --- REPLACED localStorage.setItem with setToLocalStorage ---
        const updatedAllUsers = allUsers.map(user =>
            user.email === storedUser.email ? updatedUser : user
        );
        setToLocalStorage('registeredUsers', updatedAllUsers);
      }

      showMessage('Student profile submitted successfully! 🎉', 'success');
      // Delay navigation slightly to allow message to be seen
      setTimeout(() => navigate('/student/dashboard'), 1500); // Redirect to the student dashboard

    } catch (error) {
      console.error('Error submitting profile:', error);
      showMessage('Error submitting profile. Please try again.', 'error');
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formData, uiState.errors, uiState.photoPreviewUrl, validateField, navigate, showMessage, steps, stepRequiredFields]);


  const handleNextStep = useCallback(() => {
    // Validate current step's required fields only
    let currentStepHasErrors = false;
    const requiredFieldsForCurrentStep = stepRequiredFields[uiState.currentStep] || [];

    requiredFieldsForCurrentStep.forEach(field => {
      const hasError = !validateField(field, formData[field]);
      if (hasError) currentStepHasErrors = true;
    });

    if (currentStepHasErrors) {
      showMessage('Please complete all required fields in this step before proceeding.', 'error');
      return;
    }

    setUiState(prev => ({ ...prev, currentStep: Math.min(steps.length - 1, prev.currentStep + 1) }));
  }, [formData, steps.length, validateField, showMessage, uiState.currentStep, stepRequiredFields]);


  const handlePreviousStep = useCallback(() => {
    setUiState(prev => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  }, []);

  // Render method for a single input field
  const renderInputField = useCallback((label, name, type = 'text', icon, placeholder, isRequired = false, isTextArea = false) => {
    const value = formData[name];
    const error = uiState.errors[name];
    const inputClasses = `w-full p-4 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm text-slate-900 placeholder-slate-500 ${
      error ? 'border-red-300 bg-red-50/70' : 'border-white/40 hover:border-blue-300'
    } shadow-sm hover:shadow-md`;

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          {React.cloneElement(icon, { className: "w-4 h-4 text-blue-600" })} {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        {isTextArea ? (
          <textarea
            name={name}
            value={value}
            onChange={handleChange}
            rows={4}
            className={inputClasses}
            placeholder={placeholder}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={(e) => validateField(name, e.target.value)} // Validate on blur
            className={inputClasses}
            placeholder={placeholder}
          />
        )}
        {error && <p className="text-red-500 text-sm mt-1 animate-shake">{error}</p>}
      </div>
    );
  }, [formData, uiState.errors, handleChange, validateField]);

  // Render method for select input
  const renderSelectField = useCallback((label, name, icon, options, placeholder, isRequired = false) => {
    const value = formData[name];
    const error = uiState.errors[name];
    const selectClasses = `w-full p-4 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm text-slate-900 ${
      error ? 'border-red-300 bg-red-50/70' : 'border-white/40 hover:border-blue-300'
    } shadow-sm hover:shadow-md`;

    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          {React.cloneElement(icon, { className: "w-4 h-4 text-blue-600" })} {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        <select
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={(e) => validateField(name, e.target.value)} // Validate on blur
          className={selectClasses}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1 animate-shake">{error}</p>}
      </div>
    );
  }, [formData, uiState.errors, handleChange, validateField]);

  // If user data hasn't loaded yet, show a loading state
  if (!uiState.userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <div className="flex items-center space-x-3 text-violet-600 text-lg font-medium animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-delayed"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with progress */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl p-8 mb-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <UserCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Complete Your Profile</h1>
              <p className="text-slate-600 text-lg">Help us personalize your learning experience</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200/60 rounded-full h-3 mb-6">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full h-3 transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Step indicators */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    index <= uiState.currentStep 
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                      : 'bg-white/60 backdrop-blur-sm text-slate-400 border border-white/40'
                  }`}>
                    {index < uiState.currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className="mt-2 text-sm text-slate-700 text-center font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Message/Toast */}
        {uiState.message && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-fade-in-up ${
            uiState.messageType === 'success' ? 'bg-green-500 text-white' :
            uiState.messageType === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {uiState.messageType === 'success' && <CheckCircle className="w-5 h-5" />}
            {uiState.messageType === 'error' && <X className="w-5 h-5" />}
            {uiState.messageType === 'info' && <Info className="w-5 h-5" />}
            <span className="font-semibold">{uiState.message}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center space-x-2">
                  {React.createElement(steps[uiState.currentStep].icon, { className: "w-6 h-6 text-blue-600" })}
                  <span>{steps[uiState.currentStep].title}</span>
                </h2>
                <p className="text-slate-600">Step {uiState.currentStep + 1} of {steps.length}</p>
              </div>
              
              <div className="space-y-6">
                {/* Personal Info (Read-only from login) */}
                <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm p-6 rounded-xl border border-white/40 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <UserCircle2 className="w-5 h-5 text-blue-600" /> Account Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        disabled
                        className="w-full p-3 border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm cursor-not-allowed text-slate-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        disabled
                        className="w-full p-3 border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm cursor-not-allowed text-slate-600 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 0: Personal Info - Editable */}
                {uiState.currentStep === 0 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="font-semibold text-gray-800 text-lg">Contact & Location</h3>
                    {renderInputField('Phone Number', 'phone', 'tel', <Phone className="w-4 h-4" />, 'e.g., +91 98765 43210', false)} {/* Phone is now optional */}
                    {renderInputField('Location', 'location', 'text', <MapPin className="w-4 h-4" />, 'e.g., Kolkata, West Bengal', true)}
                  </div>
                )}

                {/* Step 1: Learning Details */}
                {uiState.currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="font-semibold text-gray-800 text-lg">Your Learning Preferences</h3>
                    {renderInputField('What do you want to learn?', 'learningInterest', 'text', <BookOpenCheck className="w-4 h-4" />, 'e.g., Class 10 Mathematics, Python Programming', true)}
                    {renderSelectField(
                      'Preferred Learning Mode',
                      'mode',
                      <UserCircle2 className="w-4 h-4 text-violet-600" />,
                      [
                        { value: 'online-live', label: 'Online Live Classes' },
                        { value: 'online-recorded', label: 'Online Recorded Classes' },
                        { value: 'offline', label: 'Offline Classes' },
                        { value: 'hybrid', label: 'Hybrid (Online + Offline)' }
                      ],
                      'Select learning mode',
                      true
                    )}
                    <div className="grid md:grid-cols-2 gap-6">
                      {renderInputField('Board/University', 'board', 'text', <School className="w-4 h-4" />, 'e.g., CBSE, ICSE, State Board', true)}
                      {renderInputField('Class/Course', 'subject', 'text', <GraduationCap className="w-4 h-4" />, 'e.g., Class 12, B.Tech CSE', true)}
                    </div>
                  </div>
                )}

                {/* Step 2: Additional Info */}
                {uiState.currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="font-semibold text-gray-800 text-lg">More About You</h3>
                    {renderInputField('Tell us about yourself', 'bio', 'text', <Edit3 className="w-4 h-4" />, 'Share your interests, hobbies, or anything you\'d like your tutor to know...', false, true)}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-violet-600" /> Learning Goals (Optional)
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          name="goalInput"
                          value={uiState.goalInput}
                          onChange={handleChange}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                          className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 shadow-sm"
                          placeholder="Add a learning goal..."
                        />
                        <button
                          type="button"
                          onClick={addGoal}
                          className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors transform hover:scale-105 shadow-md"
                        >
                          Add
                        </button>
                      </div>
                      {formData.goals.length > 0 && (
                        <div className="space-y-2 p-3 bg-violet-50 rounded-xl border border-violet-100">
                          {formData.goals.map((goal) => (
                            <div key={goal.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                              <span className="text-gray-700">{goal.text}</span>
                              <button
                                type="button"
                                onClick={() => removeGoal(goal.id)}
                                className="text-red-500 hover:text-red-700 transition-colors transform hover:scale-110"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-violet-600" /> Profile Photo (Optional)
                      </label>
                      <div className="flex items-center gap-4">
                        {uiState.photoPreviewUrl && (
                          <div className="relative">
                            <img
                              src={uiState.photoPreviewUrl}
                              alt="Preview"
                              className="w-20 h-20 rounded-full object-cover border-4 border-violet-200 shadow-md"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto()}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors transform hover:scale-110 shadow-md"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          onChange={handleChange}
                          ref={fileInputRef}
                          className="flex-1 p-3 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={uiState.currentStep === 0 || uiState.isSubmitting}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                  >
                    Previous
                  </button>

                  {uiState.currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!isStepComplete() || uiState.isSubmitting} // Use the new isStepComplete
                      className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-md flex items-center gap-2 font-semibold"
                    >
                      Next
                      {isStepComplete() && <Check className="w-4 h-4" />}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={uiState.isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 font-semibold"
                    >
                      {uiState.isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Submit Profile
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Auto-save indicator */}
            {(uiState.savedDataTimestamp || uiState.isSaving) && (
              <div className={`bg-green-50 border border-green-200 rounded-xl p-4 transition-all duration-300 ${uiState.isSaving ? 'animate-pulse-opacity' : 'animate-fade-in'}`}>
                <div className="flex items-center gap-2 text-green-700">
                  {uiState.isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span className="font-medium">{uiState.isSaving ? 'Saving...' : 'Auto-saved'}</span>
                </div>
                {uiState.savedDataTimestamp && <p className="text-green-600 text-sm mt-1">Last saved at {uiState.savedDataTimestamp}</p>}
              </div>
            )}

            {/* Preview Card */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Profile Preview
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 bg-violet-50 p-2 rounded-lg">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {uiState.photoPreviewUrl ? (
                      <img src={uiState.photoPreviewUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <UserCircle2 className="w-5 h-5 text-violet-600" />
                    )}
                  </div>
                  <span className="font-medium text-gray-800">{formData.firstName || 'First'}{formData.lastName ? ` ${formData.lastName}` : ''}</span>
                </div>
                {formData.learningInterest && (
                  <p><span className="font-medium text-violet-600">Learning:</span> {formData.learningInterest}</p>
                )}
                {formData.location && (
                  <p><span className="font-medium text-violet-600">Location:</span> {formData.location}</p>
                )}
                {formData.mode && (
                  <p><span className="font-medium text-violet-600">Mode:</span> {formData.mode}</p>
                )}
                {formData.goals.length > 0 && (
                  <div>
                    <p className="font-medium text-violet-600">Goals:</p>
                    <ul className="list-disc list-inside text-xs pl-2 text-gray-700">
                      {formData.goals.map(goal => <li key={goal.id}>{goal.text}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl mb-3 shadow-lg">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Tips for a Great Profile</h3>
                <p className="text-slate-600 text-sm mt-1">Maximize your learning potential</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg border border-white/40">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Be Specific</p>
                    <p className="text-slate-600 text-xs mt-1">The more details you provide about your learning interests and goals, the better we can match you with the right tutors.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-lg border border-white/40">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-green-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Complete All Steps</p>
                    <p className="text-slate-600 text-xs mt-1">Ensure you fill out all required fields to unlock the full potential of personalized recommendations.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50/50 to-violet-50/50 rounded-lg border border-white/40">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-purple-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Add a Photo</p>
                    <p className="text-slate-600 text-xs mt-1">A profile picture helps tutors recognize you and adds a personal touch.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-lg border border-white/40">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-orange-600 text-xs font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Set Clear Goals</p>
                    <p className="text-slate-600 text-xs mt-1">Defining your learning goals helps you stay motivated and guides your tutors effectively.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 rounded-lg border border-white/40">
                  <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-teal-600 text-xs font-bold">5</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Keep it Updated</p>
                    <p className="text-slate-600 text-xs mt-1">You can always come back and modify your profile as your learning journey evolves.</p>
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

export default StudentProfileForm;
