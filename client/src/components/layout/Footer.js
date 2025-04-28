import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubscriptionStatus(null);
    setErrorMessage('');

    try {
      // Use the environment variable 
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/newsletter`, { 
        email, 
        source: 'footer' 
      });
      
      if (response.data.success) {
        setSubscriptionStatus('success');
        setEmail('');
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubscriptionStatus(null);
        }, 5000);
      } else {
        setSubscriptionStatus('error');
        setErrorMessage(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubscriptionStatus('error');
      setErrorMessage(
        error.response?.data?.message || 
        'Failed to subscribe. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo and about */}
          <div className="col-span-1">
            <div className="text-xl font-bold mb-4 text-accent">CycloFit</div>
            <p className="text-gray-300 mb-4">
              Revolutionizing bike fitting with AI technology for optimal performance and comfort.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-accent">Home</Link></li>
              <li><Link to="/features" className="text-gray-300 hover:text-accent">Features</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-accent">About Us</Link></li>
              <li><Link to="/pricing" className="text-gray-300 hover:text-accent">Pricing</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-accent">FAQ</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-accent">Blog</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-primary">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-300 hover:text-accent">Contact Us</Link></li>
              <li><Link to="/help" className="text-gray-300 hover:text-accent">Help Center</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-accent">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-accent">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-gray-300 hover:text-accent">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-primary">Newsletter</h3>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for the latest updates and offers.</p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary flex-1"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 font-medium text-dark bg-primary border border-transparent rounded-r-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              
              {subscriptionStatus === 'success' && (
                <p className="text-accent text-sm mt-2">Thanks for subscribing!</p>
              )}
              
              {subscriptionStatus === 'error' && (
                <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
              )}
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-secondary">
          <p className="text-gray-300 text-center">
            &copy; {new Date().getFullYear()} CycloFit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 