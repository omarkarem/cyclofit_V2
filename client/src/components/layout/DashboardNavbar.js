import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const DashboardNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Get user data to check if they're an admin
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  // Add scroll event listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className={`fixed top-5 left-0 right-0 z-50 flex justify-center transition-all duration-300`}>
        <div className={`w-[90%] sm:w-[80%] rounded-xl ${scrolled ? 'bg-dark bg-opacity-80' : 'bg-dark bg-opacity-50'} backdrop-blur-md`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/dashboard" className="text-accent font-bold text-xl">
                    CycloFit App
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link 
                    to="/dashboard" 
                    className={`${isActive('/dashboard') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/video-upload" 
                    className={`${isActive('/video-upload') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Video Analysis
                  </Link>
                  <Link 
                    to="/comparison" 
                    className={`${isActive('/comparison') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Compare Analyses
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`${isActive('/profile') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    My Profile
                  </Link>
                </div>
              </div>
              
              {/* Desktop Actions */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                {/* Admin Indicator & Back to Admin Link */}
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <>
                    <div className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin View
                    </div>
                    <Link
                      to="/admin/dashboard"
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Back to Admin
                    </Link>
                  </>
                )}
                
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-dark bg-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-white"
                  onClick={toggleMobileMenu}
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {!mobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-16">
          <div className="absolute inset-0 bg-dark opacity-75" onClick={toggleMobileMenu}></div>
          <nav className="relative bg-dark py-6 px-6 h-full overflow-y-auto">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/dashboard" 
                className={`${isActive('/dashboard') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMobileMenu}
              >
                Dashboard
              </Link>
              <Link 
                to="/video-upload" 
                className={`${isActive('/video-upload') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMobileMenu}
              >
                Video Analysis
              </Link>
              <Link 
                to="/comparison" 
                className={`${isActive('/comparison') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMobileMenu}
              >
                Compare Analyses
              </Link>
              <Link 
                to="/profile" 
                className={`${isActive('/profile') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMobileMenu}
              >
                My Profile
              </Link>
              <div className="pt-4 mt-4 border-t border-secondary">
                {/* Admin Indicator & Back to Admin Link for Mobile */}
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <>
                    <div className="flex items-center px-3 py-2 mb-2">
                      <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin View
                      </div>
                    </div>
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-3 py-2 text-base font-medium text-red-300 hover:text-red-100"
                      onClick={toggleMobileMenu}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Back to Admin Panel
                    </Link>
                  </>
                )}
                
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="w-full text-left flex items-center px-3 py-2 text-base font-medium text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default DashboardNavbar; 