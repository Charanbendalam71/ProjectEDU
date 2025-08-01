import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  TrendingUp, 
  Award, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Star,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find scholarships that match your profile, field of study, and eligibility criteria with our intelligent matching algorithm.",
      color: "var(--primary-500)"
    },
    {
      icon: FileText,
      title: "Streamlined Applications",
      description: "Apply to multiple scholarships with our simplified application process and document management system.",
      color: "var(--success-500)"
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your application status in real-time and receive instant updates on your submissions.",
      color: "var(--warning-500)"
    }
  ];

  const stats = [
    { number: "1000+", label: "Scholarships Available", icon: Award },
    { number: "$50M+", label: "Total Funding", icon: DollarSign },
    { number: "5000+", label: "Students Helped", icon: Users },
    { number: "95%", label: "Success Rate", icon: CheckCircle }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      content: "This platform helped me find and secure 3 scholarships worth $15,000. The application process was incredibly smooth!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Engineering Student",
      content: "The eligibility checker saved me hours of research. I found scholarships I never knew existed.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Medical Student",
      content: "Outstanding support team and easy-to-use interface. Highly recommend for any student!",
      rating: 5
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <motion.div 
              className="col-lg-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="hero-content">
                <motion.h1 
                  className="display-4 fw-bold mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  Find Your Perfect <span className="text-gradient">Scholarship</span>
                </motion.h1>
                <motion.p 
                  className="lead mb-5"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Discover thousands of scholarships for underprivileged students. 
                  Start your journey to higher education with our intelligent matching platform.
                </motion.p>
                <motion.div 
                  className="d-flex gap-3 flex-wrap"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/scholarships" className="btn btn-light btn-lg d-flex align-items-center gap-2">
                      <Search size={20} />
                      Find Scholarships
                      <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                  {!user && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/signup" className="btn btn-outline-light btn-lg">
                        Get Started Free
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="col-lg-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <GraduationCap size={200} className="text-white opacity-75" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <motion.div 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3">Why Choose Scholarship Finder?</h2>
            <p className="text-muted">Our platform is designed to make your scholarship journey seamless and successful</p>
          </motion.div>
          
          <motion.div 
            className="row"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  className="col-lg-4 col-md-6 mb-4"
                  variants={itemVariants}
                >
                  <motion.div 
                    className="card h-100 feature-card"
                    whileHover={{ y: -10, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="card-body text-center p-5">
                      <motion.div 
                        className="feature-icon mb-4"
                        style={{ color: feature.color }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon size={48} />
                      </motion.div>
                      <h5 className="card-title mb-3">{feature.title}</h5>
                      <p className="card-text text-muted">{feature.description}</p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <motion.div 
            className="row"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index}
                  className="col-lg-3 col-md-6"
                  variants={itemVariants}
                >
                  <motion.div 
                    className="stat-item"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="stat-icon mb-3"
                      style={{ color: "var(--primary-500)" }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon size={40} />
                    </motion.div>
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <motion.div 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3">What Students Say</h2>
            <p className="text-muted">Join thousands of successful students who found their perfect scholarships</p>
          </motion.div>
          
          <motion.div 
            className="row"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="col-lg-4 col-md-6 mb-4"
                variants={itemVariants}
              >
                <motion.div 
                  className="card testimonial-card h-100"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} className="text-warning me-1" fill="currentColor" />
                      ))}
                    </div>
                    <p className="card-text mb-3">"{testimonial.content}"</p>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-3">
                        <div className="avatar-initial">
                          {testimonial.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <h6 className="mb-0">{testimonial.name}</h6>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-gradient text-white">
        <div className="container">
          <motion.div 
            className="row align-items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="col-lg-8">
              <h2 className="mb-3">Ready to Start Your Scholarship Journey?</h2>
              <p className="lead mb-4">Join thousands of students who have already found their perfect scholarships through our platform.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/scholarships" className="btn btn-light btn-lg">
                  <Zap size={20} className="me-2" />
                  Get Started Now
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 