import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Search, 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  X,
  Home,
  BookOpen,
  Award,
  FileText,
  CheckCircle,
  Bell,
  MessageCircle,
  Users,
  Globe
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderNavLinks = () => {
    if (!user) {
      return [
        { to: '/', label: 'Home', icon: Home },
        { to: '/scholarships', label: 'Scholarships', icon: Award },
        { to: '/success-stories', label: 'Success Stories', icon: BookOpen }
      ];
    }

    if (user.role === 'admin') {
      return [
        { to: '/admin-dashboard', label: 'Dashboard', icon: Settings },
        { to: '/admin/applications', label: 'Applications', icon: FileText },
        { to: '/scholarships', label: 'Manage Scholarships', icon: Award },
        { to: '/admin/feedback', label: 'Feedback Management', icon: MessageCircle },
        { to: '/chatbot', label: 'ChatBot AI', icon: Globe }
      ];
    }

    return [
      { to: '/student-dashboard', label: 'Dashboard', icon: Settings },
      { to: '/scholarships', label: 'Search Scholarships', icon: Search },
      { to: '/recommendations', label: 'Recommendations', icon: Award },
      { to: '/applications', label: 'My Applications', icon: FileText },
      { to: '/documents', label: 'Document Vault', icon: FileText },
      { to: '/eligibility', label: 'Eligibility Checker', icon: CheckCircle },
      { to: '/alerts', label: 'Alerts', icon: Bell },
      { to: '/success-stories', label: 'Success Stories', icon: BookOpen },
      { to: '/feedback', label: 'Support & Feedback', icon: MessageCircle },
      { to: '/chatbot', label: 'ChatBot AI', icon: Globe }
    ];
  };

  const navLinks = renderNavLinks();

  return (
    <motion.nav 
      className="navbar navbar-expand-lg navbar-dark"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container-fluid">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link className="navbar-brand" to="/">
            <GraduationCap size={28} className="me-2" />
            Scholarship Finder
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button 
          className="navbar-toggler d-lg-none" 
          type="button" 
          onClick={toggleMobileMenu}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Desktop Navigation */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              
              return (
                <motion.li 
                  key={link.to}
                  className="nav-item"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    className={`nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`} 
                    to={link.to}
                  >
                    <Icon size={18} />
                    {link.label}
                    {isActive && (
                      <motion.div
                        className="active-indicator"
                        layoutId="activeIndicator"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>

          <div className="navbar-nav">
            {user ? (
              <div className="nav-item dropdown" ref={dropdownRef}>
                <motion.button 
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" 
                  type="button" 
                  onClick={toggleDropdown}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="rounded-circle"
                      style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={18} />
                  )}
                  {user.name || (user.role === 'admin' ? 'Admin' : 'Student')}
                </motion.button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.ul 
                      className="dropdown-menu dropdown-menu-end"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'block' }}
                    >
                      <motion.li
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile" onClick={() => setIsDropdownOpen(false)}>
                          <User size={16} />
                          Profile
                        </Link>
                      </motion.li>
                      <li><hr className="dropdown-divider" /></li>
                      <motion.li
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button className="dropdown-item d-flex align-items-center gap-2" onClick={handleLogout}>
                          <LogOut size={16} />
                          Logout
                        </button>
                      </motion.li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link className="nav-link" to="/login">Login</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link className="btn btn-light" to="/signup">Sign Up</Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container-fluid">
              <ul className="mobile-nav-list">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  
                  return (
                    <motion.li 
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        className={`mobile-nav-link d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`} 
                        to={link.to}
                      >
                        <Icon size={20} />
                        {link.label}
                      </Link>
                    </motion.li>
                  );
                })}
                {user && (
                  <>
                    <motion.li 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.1 }}
                    >
                      <Link className="mobile-nav-link d-flex align-items-center gap-3" to="/profile">
                        <User size={20} />
                        Profile
                      </Link>
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navLinks.length + 1) * 0.1 }}
                    >
                      <button className="mobile-nav-link d-flex align-items-center gap-3 w-100 text-start" onClick={handleLogout}>
                        <LogOut size={20} />
                        Logout
                      </button>
                    </motion.li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar; 