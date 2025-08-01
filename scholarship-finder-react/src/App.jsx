import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FloatingChatbot from './components/FloatingChatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ScholarshipList from './pages/ScholarshipList';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ApplicationTracker from './pages/ApplicationTracker';
import ApplicationForm from './pages/ApplicationForm';
import AdminApplications from './pages/AdminApplications';
import AdminFeedback from './pages/AdminFeedback';
import Profile from './pages/Profile';
import Eligibility from './pages/Eligibility';
import Chatbot from './pages/Chatbot';
import Feedback from './pages/Feedback';
import Partnerships from './pages/Partnerships';
import Alerts from './pages/Alerts';
import DocumentVault from './pages/DocumentVault';
import Recommendation from './pages/Recommendation';
import SuccessStories from './pages/SuccessStories';
import Multilingual from './pages/Multilingual';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-4">
          <div className="alert alert-danger">
            <h4>Something went wrong</h4>
            <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Error Fallback Component
const ErrorFallback = ({ error }) => {
  return (
    <div className="container mt-4">
      <div className="alert alert-danger">
        <h4>Something went wrong</h4>
        <p>{error?.message || 'An unexpected error occurred'}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="container mt-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/scholarships" element={<ScholarshipList />} />
                <Route path="/student-dashboard" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/applications" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ApplicationTracker />
                  </ProtectedRoute>
                } />
                <Route path="/apply/:scholarshipId" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ApplicationForm />
                  </ProtectedRoute>
                } />
                <Route path="/admin/applications" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminApplications />
                  </ProtectedRoute>
                } />
                <Route path="/admin/feedback" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminFeedback />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/eligibility" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Eligibility />
                  </ProtectedRoute>
                } />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/partnerships" element={<Partnerships />} />
                <Route path="/alerts" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Alerts />
                  </ProtectedRoute>
                } />
                <Route path="/documents" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DocumentVault />
                  </ProtectedRoute>
                } />
                <Route path="/recommendations" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Recommendation />
                  </ProtectedRoute>
                } />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route path="/multilingual" element={<Multilingual />} />
                
                {/* Catch-all route for debugging */}
                <Route path="*" element={
                  <div className="container mt-4">
                    <div className="alert alert-warning">
                      <h4>Page Not Found</h4>
                      <p>The page you're looking for doesn't exist.</p>
                      <a href="/" className="btn btn-primary">Go Home</a>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
            <FloatingChatbot />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App; 