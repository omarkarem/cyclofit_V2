import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <header className={`fixed top-5 left-0 right-0 z-50 flex justify-center transition-all duration-300`}>
        <div className={`w-[90%] sm:w-[80%] rounded-xl ${scrolled ? 'bg-red-900 bg-opacity-80' : 'bg-red-900 bg-opacity-70'} backdrop-blur-md border border-red-700`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/admin/dashboard" className="text-white font-bold text-xl flex items-center">
                    <svg className="w-8 h-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    CycloFit Admin
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link 
                    to="/admin/dashboard" 
                    className={`${isActive('/admin/dashboard') ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white hover:border-yellow-400 hover:text-yellow-400'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/users" 
                    className={`${isActive('/admin/users') ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white hover:border-yellow-400 hover:text-yellow-400'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    Users
                  </Link>
                  <Link 
                    to="/admin/analyses" 
                    className={`${isActive('/admin/analyses') ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white hover:border-yellow-400 hover:text-yellow-400'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    Analyses
                  </Link>
                  <Link 
                    to="/admin/contacts" 
                    className={`${isActive('/admin/contacts') ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white hover:border-yellow-400 hover:text-yellow-400'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    Contacts
                  </Link>
                  <Link 
                    to="/admin/system" 
                    className={`${isActive('/admin/system') ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-white hover:border-yellow-400 hover:text-yellow-400'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    System
                  </Link>
                </div>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                <Link
                  to="/dashboard"
                  className="text-white hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  User View
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
              
              <div className="sm:hidden flex items-center">
                <button
                  type="button"
                  className="text-white hover:text-yellow-400 focus:outline-none focus:text-yellow-400"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                  onClick={toggleMobileMenu}
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-16">
          <div className="absolute inset-0 bg-red-900 opacity-90" onClick={toggleMobileMenu}></div>
          <nav className="relative bg-red-900 py-6 px-6 h-full overflow-y-auto">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/admin/dashboard" 
                className={`${isActive('/admin/dashboard') ? 'text-yellow-400 font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium transition-colors`}
                onClick={toggleMobileMenu}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/users" 
                className={`${isActive('/admin/users') ? 'text-yellow-400 font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium transition-colors`}
                onClick={toggleMobileMenu}
              >
                Users
              </Link>
              <Link 
                to="/admin/analyses" 
                className={`${isActive('/admin/analyses') ? 'text-yellow-400 font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium transition-colors`}
                onClick={toggleMobileMenu}
              >
                Analyses
              </Link>
              <Link 
                to="/admin/contacts" 
                className={`${isActive('/admin/contacts') ? 'text-yellow-400 font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium transition-colors`}
                onClick={toggleMobileMenu}
              >
                Contacts
              </Link>
              <Link 
                to="/admin/system" 
                className={`${isActive('/admin/system') ? 'text-yellow-400 font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium transition-colors`}
                onClick={toggleMobileMenu}
              >
                System
              </Link>
              
              <div className="border-t border-red-700 pt-4 mt-4">
                <Link
                  to="/dashboard"
                  className="text-white hover:text-yellow-400 block px-3 py-2 text-base font-medium transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Switch to User View
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="text-white hover:text-yellow-400 block px-3 py-2 text-base font-medium transition-colors w-full text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default AdminNavbar; 