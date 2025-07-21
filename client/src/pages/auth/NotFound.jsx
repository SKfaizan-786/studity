// client/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center max-w-md w-full border border-gray-200">
        <Frown className="w-24 h-24 text-red-500 mx-auto mb-6 animate-bounce-slow" />
        <h1 className="text-5xl font-extrabold text-red-600 mb-4">404</h1>
        <p className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</p>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-violet-600 text-white rounded-full font-semibold text-lg shadow-lg
                     hover:bg-violet-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
