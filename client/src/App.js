import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import VideoUpload from './pages/VideoUpload';
import AnalysisFeedback from './pages/AnalysisFeedback';
import ComparisonAnalysis from './pages/ComparisonAnalysis';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import AdminSetup from './pages/AdminSetup';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSystem from './pages/AdminSystem';
import AdminAnalyses from './pages/AdminAnalyses';
import AdminAnalysisView from './pages/AdminAnalysisView';
import AdminContacts from './pages/AdminContacts';
import ScrollToTop from './components/ScrollToTop';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" />;
  }
  return children;
};

// Component to handle OAuth callback
function OAuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError('Authentication failed. Please try again.');
      setLoading(false);
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Get the redirect path or default to dashboard
      const redirectPath = localStorage.getItem('redirectPath') || '/dashboard';
      localStorage.removeItem('redirectPath'); // Clean up
      
      // Get user data
      fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate(redirectPath);
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
          navigate(redirectPath); // Still redirect even if user data fetch fails
        });
    } else {
      setError('No authentication token received');
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary bg-opacity-10">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-secondary">Completing authentication, please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary bg-opacity-10">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-primary mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-center mb-2 text-dark">Authentication Error</h3>
          <p className="text-secondary text-center mb-4">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-accent"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Marketing Routes - No Login Required */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin Setup - TEMPORARY (Remove after creating admins) */}
        <Route path="/admin-setup" element={<AdminSetup />} />
        <Route path="/profile-setup" element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        } />
        
        {/* Application Routes - Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/video-upload" element={
          <ProtectedRoute>
            <VideoUpload />
          </ProtectedRoute>
        } />
        <Route path="/analysis-feedback" element={
          <ProtectedRoute>
            <AnalysisFeedback />
          </ProtectedRoute>
        } />
        <Route path="/analysis/:id" element={
          <ProtectedRoute>
            <AnalysisFeedback />
          </ProtectedRoute>
        } />
        <Route path="/comparison" element={
          <ProtectedRoute>
            <ComparisonAnalysis />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Admin Routes - Protected */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/system" element={
          <ProtectedRoute>
            <AdminSystem />
          </ProtectedRoute>
        } />
        <Route path="/admin/analyses" element={
          <ProtectedRoute>
            <AdminAnalyses />
          </ProtectedRoute>
        } />
        <Route path="/admin/analysis/:analysisId" element={
          <ProtectedRoute>
            <AdminAnalysisView />
          </ProtectedRoute>
        } />
        <Route path="/admin/contacts" element={
          <ProtectedRoute>
            <AdminContacts />
          </ProtectedRoute>
        } />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;