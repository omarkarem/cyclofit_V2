import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center">
      <div className={`w-[90%] sm:w-[80%] rounded-xl ${scrolled ? 'bg-dark bg-opacity-80' : 'bg-dark bg-opacity-50'} backdrop-blur-md transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-accent font-bold text-xl">
                  CycloFit
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  to="/" 
                  className={`${isActive('/') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Home
                </Link>
                <Link 
                  to="/features" 
                  className={`${isActive('/features') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Features
                </Link>
                <Link 
                  to="/about" 
                  className={`${isActive('/about') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  About Us
                </Link>
                <Link 
                  to="/pricing" 
                  className={`${isActive('/pricing') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Pricing
                </Link>
                <Link 
                  to="/faq" 
                  className={`${isActive('/faq') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  FAQ
                </Link>
                <Link 
                  to="/blog" 
                  className={`${isActive('/blog') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  className={`${isActive('/contact') ? 'border-accent text-accent' : 'border-transparent text-white hover:border-accent hover:text-accent'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Contact
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link to="/dashboard" className="ml-3 inline-flex items-center px-4 pt-2 pb-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-dark bg-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200">
                Launch App
              </Link>
            </div>
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
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

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="fixed inset-0 z-40 pt-16">
          <div className="absolute inset-0 bg-dark opacity-75" onClick={toggleMenu}></div>
          <nav className="relative bg-dark py-6 px-6 h-full overflow-y-auto">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`${isActive('/') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className={`${isActive('/features') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMenu}
              >
                Features
              </Link>
              <Link 
                to="/about" 
                className={`${isActive('/about') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMenu}
              >
                About Us
              </Link>
              <Link 
                to="/pricing" 
                className={`${isActive('/pricing') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMenu}
              >
                Pricing
              </Link>
              <Link 
                to="/faq" 
                className={`${isActive('/faq') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMenu}
              >
                FAQ
              </Link>
              <Link 
                to="/blog" 
                className={`${isActive('/blog') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMenu}
              >
                Blog
              </Link>
              <Link 
                to="/contact" 
                className={`${isActive('/contact') ? 'text-accent font-semibold' : 'text-white'} block px-3 py-2 text-base font-medium`}
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <div className="pt-4 mt-4 border-t border-secondary">
                <Link 
                  to="/dashboard" 
                  className="w-full flex justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-dark bg-primary hover:bg-accent"
                  onClick={toggleMenu}
                >
                  Launch App
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar; 