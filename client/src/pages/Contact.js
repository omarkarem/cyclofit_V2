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
                          placeholder="Enter your name"
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
                          placeholder="Enter your email"
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
                        placeholder="Enter your message ..."
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