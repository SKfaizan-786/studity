import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  ArrowRight, 
  Users, 
  BookOpen, 
  Star,
  Play,
  CheckCircle,
  Clock,
  Award,
  MessageCircle,
  Zap,
  TrendingUp,
  Shield,
  Heart
} from 'lucide-react';

// Animation variants for sta                Join thousand              Join Yuvshiksha today and connect with expert tutors who will help you achieve your academic goals. of students and teachers who have found success with Yuvshikshagered appearance
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

// Hero Stats Component
const StatCard = ({ number, label, delay }) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay + 0.5, duration: 0.6 }}
  >
    <div className="text-3xl font-bold text-slate-800 mb-1">{number}</div>
    <div className="text-sm text-slate-600 font-medium">{label}</div>
  </motion.div>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay, className = "" }) => (
  <motion.div
    className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
  >
    <div className="mb-4">
      {React.cloneElement(icon, { className: "w-6 h-6 text-blue-600" })}
    </div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

// Testimonial Component
const TestimonialCard = ({ name, role, content, avatar, delay }) => (
  <motion.div
    className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/40"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
  >
    <div className="flex items-center mb-3">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-slate-600 text-sm mb-4 leading-relaxed">"{content}"</p>
    <div className="flex items-center">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
        {name.charAt(0)}
      </div>
      <div className="ml-3">
        <div className="font-medium text-slate-800 text-sm">{name}</div>
        <div className="text-xs text-slate-500">{role}</div>
      </div>
    </div>
  </motion.div>
);

export default function HomePage() {
  const features = [
    {
      icon: <Users />,
      title: 'Expert Teachers',
      description: 'Learn from verified, experienced educators who are passionate about your success.',
    },
    {
      icon: <Clock />,
      title: 'Flexible Scheduling',
      description: 'Book lessons at your convenience with 24/7 availability across different time zones.',
    },
    {
      icon: <BookOpen />,
      title: 'Personalized Learning',
      description: 'Customized lesson plans tailored to your learning style and academic goals.',
    },
    {
      icon: <Shield />,
      title: 'Safe & Secure',
      description: 'Secure payments, verified profiles, and monitored sessions for your peace of mind.',
    },
    {
      icon: <TrendingUp />,
      title: 'Track Progress',
      description: 'Monitor your improvement with detailed analytics and progress reports.',
    },
    {
      icon: <Heart />,
      title: 'Student Success',
      description: 'Join thousands of students who have achieved their academic goals with us.',
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Math Student",
      content: "The tutoring here is amazing! My grades improved dramatically and I actually enjoy learning now.",
      delay: 0.1
    },
    {
      name: "David Kumar",
      role: "Physics Teacher", 
      content: "As an educator, I love how this platform connects me with motivated students worldwide.",
      delay: 0.2
    },
    {
      name: "Emily Rodriguez",
      role: "Parent",
      content: "My daughter's confidence in science has grown so much. The teachers are patient and skilled.",
      delay: 0.3
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Animated gradient orbs for background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-20 left-1/4 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-gradient-to-tr from-violet-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 pt-16">
        {/* Hero Section */}
        <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-8 border border-white/20">
                  <Zap className="w-4 h-4 mr-2" />
                  Connecting students with expert teachers worldwide
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                Learn from the best,{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  achieve your goals
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Find qualified tutors for personalized 1-on-1 lessons. Book instantly, 
                learn at your pace, and excel in any subject with Yuvshiksha.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Link 
                  to="/signup"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Start Learning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link 
                  to="/login"
                  className="inline-flex items-center px-8 py-4 bg-white/70 backdrop-blur-sm border-2 border-white/40 text-slate-700 font-semibold rounded-2xl hover:bg-white/80 hover:border-white/60 transition-all duration-200"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Sign In
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <StatCard number="10,000+" label="Students" delay={0.1} />
                <StatCard number="500+" label="Expert Teachers" delay={0.2} />
                <StatCard number="50+" label="Subjects" delay={0.3} />
              </motion.div>
            </div>
          </div>
        </section>
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              Everything you need to succeed
            </motion.h2>
            <motion.p
              className="text-lg text-slate-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Our platform provides all the tools and support you need for effective online learning
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                {...feature} 
                delay={0.3 + (index * 0.1)} 
                className="bg-white/60 backdrop-blur-sm border-white/40"
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              How Yuvshiksha works
            </motion.h2>
            <motion.p
              className="text-lg text-slate-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Getting started is simple. Connect with expert tutors in just a few steps.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Browse Teachers</h3>
              <p className="text-slate-600">Find the perfect tutor based on subject, availability, and reviews.</p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Book a Session</h3>
              <p className="text-slate-600">Schedule your lesson at a time that works for you and make secure payment.</p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Start Learning</h3>
              <p className="text-slate-600">Join your online session and start achieving your academic goals.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              What our community says
            </motion.h2>
            <motion.p
              className="text-lg text-slate-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Join thousands of students and teachers who have found success with Yuvshiksha
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Ready to start your learning journey?
          </motion.h2>
          <motion.p
            className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Join Yuvshiksha today and connect with expert tutors who will help you achieve your academic goals.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link 
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors duration-200"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/20 bg-white/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <GraduationCap className="w-8 h-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-slate-900">Yuvshiksha</span>
              </div>
              <div className="flex items-center space-x-6">
                <Link to="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
                  About
                </Link>
                <Link to="/contact" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Contact
                </Link>
                <Link to="/help" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Help
                </Link>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20 text-center">
              <p className="text-slate-500 text-sm">
                © 2025 Yuvshiksha. All rights reserved. Made with ❤️ for students and teachers worldwide.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
