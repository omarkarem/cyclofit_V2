import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import axios from 'axios';

const Blog = () => {
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
        source: 'blog' 
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

  const blogPosts = [
    {
      id: 1,
      title: '5 Essential Bike Fit Adjustments Every Cyclist Should Know',
      excerpt: 'Learn the key bike fit adjustments that can make a huge difference in your comfort and performance on the bike.',
      date: 'June 15, 2023',
      author: 'Sarah Johnson',
      category: 'Bike Fitting',
      image: '/images/blog/bike-fit.jpg'
    },
    {
      id: 2,
      title: 'How to Analyze Your Pedal Stroke for Maximum Efficiency',
      excerpt: 'Discover professional techniques to analyze and improve your pedal stroke for better power transfer and reduced injury risk.',
      date: 'May 28, 2023',
      author: 'Michael Rodriguez',
      category: 'Training',
      image: '/images/blog/pedal-stroke.jpg'
    },
    {
      id: 3,
      title: 'The Science Behind Optimal Cycling Posture',
      excerpt: 'Explore the biomechanics of cycling posture and how small adjustments can lead to significant performance gains.',
      date: 'May 12, 2023',
      author: 'Dr. Emily Taylor',
      category: 'Biomechanics',
      image: '/images/blog/cycling-posture.jpg'
    },
    {
      id: 4,
      title: "Training with Power: A Beginner's Guide",
      excerpt: 'Everything you need to know about power meters, how to interpret the data, and how to use it to structure your training.',
      date: 'April 30, 2023',
      author: 'David Chen',
      category: 'Training',
      image: '/images/blog/power-training.jpg'
    },
    {
      id: 5,
      title: 'Recovery Techniques for Cyclists: What Actually Works',
      excerpt: 'Cut through the marketing hype and learn which recovery methods are backed by science and which are just myths.',
      date: 'April 15, 2023',
      author: 'Dr. Emily Taylor',
      category: 'Recovery',
      image: '/images/blog/recovery.jpg'
    },
    {
      id: 6,
      title: 'Indoor vs Outdoor Training: Optimizing Both for Your Goals',
      excerpt: 'How to balance indoor and outdoor riding to maximize your training efficiency throughout the year.',
      date: 'March 29, 2023',
      author: 'Michael Rodriguez',
      category: 'Training',
      image: '/images/blog/indoor-outdoor.jpg'
    }
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/api/blog`);
      } catch (error) {
        console.error('Error fetching blog articles:', error);
      }
    };
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-secondary bg-opacity-10 pt-36 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-dark">CycloFit Blog</h1>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Expert advice, training tips, and the latest cycling technology insights.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-secondary mb-2">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.category}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-dark">{post.title}</h3>
                  <p className="text-secondary mb-4">{post.excerpt}</p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-3 text-primary font-semibold">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-secondary">{post.author}</span>
                  </div>
                  <Link to={`/blog/${post.id}`} className="mt-4 inline-block text-primary font-medium hover:text-accent transition-colors duration-300">
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Subscribe to Our Newsletter</h2>
            <p className="text-xl mb-8">Get the latest cycling tips, training advice, and technology updates delivered straight to your inbox.</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-6 py-3 rounded-full flex-1 text-dark focus:outline-none focus:ring-2 focus:ring-accent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                className={`bg-dark text-accent px-8 py-3 rounded-full font-semibold hover:bg-secondary transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            
            {subscriptionStatus === 'success' && (
              <p className="text-white text-center bg-dark bg-opacity-20 py-2 px-4 rounded-full inline-block mt-4">
                Thanks for subscribing! You've been added to our newsletter.
              </p>
            )}
            
            {subscriptionStatus === 'error' && (
              <p className="text-white text-center bg-red-600 bg-opacity-20 py-2 px-4 rounded-full inline-block mt-4">
                {errorMessage}
              </p>
            )}
            
            <p className="mt-4 text-sm text-white opacity-80">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-dark">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link to="/blog/category/training" className="bg-secondary bg-opacity-10 hover:bg-opacity-20 transition-colors duration-300 rounded-lg p-6 text-center">
              <div className="bg-primary bg-opacity-20 text-primary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">Training</h3>
              <p className="text-sm text-secondary mt-2">24 articles</p>
            </Link>
            <Link to="/blog/category/bike-fitting" className="bg-secondary bg-opacity-10 hover:bg-opacity-20 transition-colors duration-300 rounded-lg p-6 text-center">
              <div className="bg-primary bg-opacity-20 text-primary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">Bike Fitting</h3>
              <p className="text-sm text-secondary mt-2">16 articles</p>
            </Link>
            <Link to="/blog/category/nutrition" className="bg-secondary bg-opacity-10 hover:bg-opacity-20 transition-colors duration-300 rounded-lg p-6 text-center">
              <div className="bg-primary bg-opacity-20 text-primary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">Nutrition</h3>
              <p className="text-sm text-secondary mt-2">18 articles</p>
            </Link>
            <Link to="/blog/category/technology" className="bg-secondary bg-opacity-10 hover:bg-opacity-20 transition-colors duration-300 rounded-lg p-6 text-center">
              <div className="bg-primary bg-opacity-20 text-primary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="font-bold text-dark">Technology</h3>
              <p className="text-sm text-secondary mt-2">12 articles</p>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog; 