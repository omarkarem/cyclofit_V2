import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import SmoothScroll from '../components/SmoothScroll';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/contact`, formData);
      
      if (response.data.success) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        // Clear success message after 5 seconds
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage(
        error.response?.data?.message || 
        'There was an error sending your message. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <SmoothScroll />
      <section className="bg-gradient-to-b from-dark to-secondary text-white pt-36 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl md:text-2xl mb-8">
              We'd love to hear from you. Let us know how we can help!
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center">
              {/* <div className="md:w-1/3">
                <div className="bg-white shadow-lg rounded-xl p-8 sticky top-32">
                  <h2 className="text-2xl font-bold mb-6 text-dark">Contact Information</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-primary text-xl mt-1 mr-4" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1 text-dark">Our Location</h3>
                        <p className="text-secondary">
                          123 Cycling Street<br />
                          San Francisco, CA 94103<br />
                          United States
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaEnvelope className="text-primary text-xl mt-1 mr-4" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1 text-dark">Email Us</h3>
                        <p className="text-secondary">
                          <a href="mailto:support@cyclofit.com" className="hover:text-primary transition">support@cyclofit.com</a><br />
                          <a href="mailto:info@cyclofit.com" className="hover:text-primary transition">info@cyclofit.com</a>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaPhoneAlt className="text-primary text-xl mt-1 mr-4" />
                      <div>
                        <h3 className="font-semibold text-lg mb-1 text-dark">Call Us</h3>
                        <p className="text-secondary">
                          <a href="tel:+11234567890" className="hover:text-primary transition">+1 (123) 456-7890</a><br />
                          <span className="text-sm">Monday-Friday, 9am-6pm PST</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="font-semibold text-lg mb-4 text-dark">Follow Us</h3>
                    <div className="flex space-x-4">
                      <a href="https://twitter.com/cyclofit" target="_blank" rel="noopener noreferrer" className="bg-secondary bg-opacity-10 hover:bg-primary hover:bg-opacity-20 text-secondary hover:text-primary p-3 rounded-full transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                        </svg>
                      </a>
                      <a href="https://facebook.com/cyclofit" target="_blank" rel="noopener noreferrer" className="bg-secondary bg-opacity-10 hover:bg-primary hover:bg-opacity-20 text-secondary hover:text-primary p-3 rounded-full transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                      <a href="https://instagram.com/cyclofit" target="_blank" rel="noopener noreferrer" className="bg-secondary bg-opacity-10 hover:bg-primary hover:bg-opacity-20 text-secondary hover:text-primary p-3 rounded-full transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                        </svg>
                      </a>
                      <a href="https://youtube.com/cyclofit" target="_blank" rel="noopener noreferrer" className="bg-secondary bg-opacity-10 hover:bg-primary hover:bg-opacity-20 text-secondary hover:text-primary p-3 rounded-full transition">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div> */}
              
              <div className="max-w-xl w-full">
                <h2 className="text-2xl font-bold mb-8 text-dark text-center">Send Us a Message</h2>
                
                {submitStatus === 'success' && (
                  <div className="mb-8 bg-primary bg-opacity-10 border border-primary border-opacity-30 text-primary px-5 py-4 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Your message has been sent successfully. We'll get back to you as soon as possible!
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-8 bg-red-50 border border-red-300 text-red-700 px-5 py-4 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {errorMessage || 'Something went wrong. Please try again.'}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-xl rounded-2xl p-10 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="name" className="block text-sm font-medium text-dark mb-2 group-hover:text-primary transition-colors">Your Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-all group-hover:border-primary/50"
                          placeholder="John Doe"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="group">
                      <label htmlFor="email" className="block text-sm font-medium text-dark mb-2 group-hover:text-primary transition-colors">Your Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-all group-hover:border-primary/50"
                          placeholder="john@example.com"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="subject" className="block text-sm font-medium text-dark mb-2 group-hover:text-primary transition-colors">Subject</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-all group-hover:border-primary/50"
                        placeholder="How can we help you?"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="message" className="block text-sm font-medium text-dark mb-2 group-hover:text-primary transition-colors">Message</label>
                    <div className="relative">
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="6"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-all group-hover:border-primary/50"
                        placeholder="Tell us about your inquiry..."
                        required
                        disabled={isLoading}
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <button
                      type="submit"
                      className={`px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-accent hover:text-dark transition duration-300 hover:shadow-lg flex items-center mx-auto ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary bg-opacity-5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-dark">Frequently Asked Questions</h2>
            <p className="text-secondary mb-12">
              Have questions about CycloFit? Check out our most commonly asked questions below.
            </p>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-left">
                <h3 className="text-xl font-semibold mb-2 text-dark">How does the video analysis work?</h3>
                <p className="text-secondary">
                  Our proprietary AI technology analyzes your cycling videos, identifying key body positions and movements
                  to provide detailed insights about your cycling technique and posture.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-left">
                <h3 className="text-xl font-semibold mb-2 text-dark">Is my data secure?</h3>
                <p className="text-secondary">
                  Yes, we take data security very seriously. All videos and personal information are encrypted, and you
                  have complete control over your data. You can delete your videos at any time.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-left">
                <h3 className="text-xl font-semibold mb-2 text-dark">Can I use CycloFit on my mobile device?</h3>
                <p className="text-secondary">
                  Absolutely! CycloFit is optimized for both desktop and mobile devices. You can record videos directly from
                  your smartphone and upload them through our mobile app.
                </p>
              </div>
            </div>
            
            <div className="mt-12">
              <Link to="/faq" className="inline-flex items-center text-primary hover:text-accent font-medium">
                View all FAQs
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact; 