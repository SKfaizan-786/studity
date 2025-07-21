// client/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Lightbulb, Users, BookOpen, BarChart2, Award, Globe, MessageSquare } from 'lucide-react';

// Animation variants for staggered appearance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// A reusable Feature component with enhanced styling and animation
const Feature = ({ icon, title, description, delay }) => (
  <motion.div
    className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl text-center border border-indigo-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ease-out"
    variants={itemVariants} // Apply itemVariants for staggered animation
    initial="hidden"
    animate="visible"
    transition={{ delay, duration: 0.6, ease: 'easeOut' }}
  >
    <div className="flex justify-center mb-5">
      {React.cloneElement(icon, { className: `${icon.props.className} w-12 h-12 transition-transform duration-300 group-hover:rotate-6` })}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-indigo-800">{title}</h3>
    <p className="text-gray-700 leading-relaxed">{description}</p>
  </motion.div>
);

export default function HomePage() { // Renamed from Landing to HomePage for clarity in routing
  const baseClasses = `min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 transition-all duration-700 ease-in-out bg-gradient-to-br from-indigo-50 via-blue-100 to-purple-100 text-slate-900 overflow-hidden relative`;
  const buttonBaseClasses = `px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl`;
  const primaryButtonClasses = `bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700`;
  const secondaryButtonClasses = `bg-white border-2 border-indigo-400 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-500`;

  const features = [
    {
      icon: <Users className="text-violet-600" />,
      title: 'Dynamic Collaboration',
      description: 'Engage with peers and expert instructors in real-time, fostering a vibrant learning environment.',
      delay: 0.3,
    },
    {
      icon: <BookOpen className="text-blue-600" />,
      title: 'Extensive Content Library',
      description: 'Access a rich and diverse collection of courses, interactive tutorials, and comprehensive study materials.',
      delay: 0.5,
    },
    {
      icon: <BarChart2 className="text-purple-600" />,
      title: 'Personalized Progress Tracking',
      description: 'Monitor your academic growth with intuitive analytics and receive tailored insights to optimize your learning path.',
      delay: 0.7,
    },
    {
      icon: <Award className="text-green-600" />,
      title: 'Certified Instructors',
      description: 'Learn from highly qualified and experienced educators dedicated to your success.',
      delay: 0.9,
    },
    {
      icon: <Globe className="text-orange-600" />,
      title: 'Global Community',
      description: 'Connect with learners and teachers worldwide, broadening your perspective and network.',
      delay: 1.1,
    },
    {
      icon: <Lightbulb className="text-yellow-600" />,
      title: 'Innovative Learning Tools',
      description: 'Utilize cutting-edge tools and interactive exercises designed to make learning engaging and effective.',
      delay: 1.3,
    },
  ];

  return (
    <div className={baseClasses}>
      {/* Animated Blobs (more subtle and varied) */}
      <motion.div
        className="absolute top-[10%] left-[15%] w-48 h-48 bg-violet-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 0.9, 1],
          rotate: [0, 120, 240, 360],
          x: [0, 50, -50, 0],
          y: [0, -30, 30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[10%] w-60 h-60 bg-blue-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 0.9, 1.1, 1],
          x: [0, -70, 70, 0],
          y: [0, 40, -40, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, delay: 5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[50%] left-[5%] w-36 h-36 bg-purple-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          y: [0, 60, -60, 0],
          rotate: [0, -100, 100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, delay: 10, ease: "easeInOut" }}
      />
       <motion.div
        className="absolute bottom-[5%] left-[30%] w-32 h-32 bg-pink-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 0.8, 1],
          x: [0, 40, -40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, delay: 3, ease: "easeInOut" }}
      />

      <motion.div
        className="max-w-5xl w-full text-center space-y-10 p-6 sm:p-10 rounded-3xl relative z-10 bg-white/80 backdrop-blur-md shadow-3xl border border-white"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-indigo-800 leading-tight"
          variants={itemVariants}
        >
          Your Transformative Learning Journey Starts Here
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-700 leading-relaxed"
          variants={itemVariants}
        >
          A cutting-edge platform designed to empower **students to excel** and **teachers to inspire** — seamlessly integrated for optimal growth.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Link to="/signup" className={`${buttonBaseClasses} ${primaryButtonClasses}`}>
              Get Started <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Link to="/login" className={`${buttonBaseClasses} ${secondaryButtonClasses}`}>
              <Zap className="w-6 h-6" /> Log In
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <div className="mt-20">
          <motion.h2
            className="text-4xl font-bold text-center mb-12 text-indigo-800"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Why Choose Our Platform?
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature, index) => (
              <Feature key={index} {...feature} />
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-10 border-t border-gray-200 text-gray-600 text-sm">
          <p className="flex items-center justify-center gap-2 mb-3 text-base">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            Have questions? We're here to help!
          </p>
          <p className="text-base">
            Visit our <Link to="/contact" className="text-indigo-600 hover:underline font-medium">Support Center</Link> or learn more <Link to="/about" className="text-indigo-600 hover:underline font-medium">About Us</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
