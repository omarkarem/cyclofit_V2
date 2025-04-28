import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import homeImage from '../assets/images/home/Home_Cycling_Using_App.jpg';
import SmoothScroll from '../components/SmoothScroll';

const Home = () => {
  return (
    <Layout>
      <SmoothScroll />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-dark to-secondary text-white pt-36 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:space-x-8">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Revolutionize Your Cycling Experience</h1>
              <p className="text-xl md:text-2xl mb-8">
                AI-powered bike fitting that helps you optimize performance, improve comfort, and reduce injury risk.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register" className="px-8 py-3 bg-primary text-dark font-bold rounded-full hover:bg-accent transition duration-300 text-center">
                  Start Free Trial
                </Link>
                <Link to="/features" className="px-8 py-3 border-2 border-primary text-white font-bold rounded-full hover:bg-primary hover:text-dark transition duration-300 text-center">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img src={homeImage} alt="Cyclist using CycloFit app" className="rounded-xl shadow-lg w-full"/>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#393E46] bg-opacity-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#222832]">Why Choose CycloFit?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="bg-[#00ADB5] bg-opacity-20 text-[#00ADB5] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#222832]">Advanced Analytics</h3>
              <p className="text-[#393E46]">Get detailed insights into your performance with our comprehensive analytics dashboard.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="bg-[#00ADB5] bg-opacity-20 text-[#00ADB5] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#222832]">Real-time Feedback</h3>
              <p className="text-[#393E46]">Receive instant feedback on your cycling technique and performance during your rides.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="bg-[#00ADB5] bg-opacity-20 text-[#00ADB5] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#222832]">Personalized Plans</h3>
              <p className="text-[#393E46]">Custom training plans designed specifically for your goals, abilities, and schedule.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#00ADB5] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Level Up Your Cycling?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of cyclists who have transformed their performance with CycloFit's cutting-edge technology.</p>
          <Link to="/register" className="bg-[#222832] text-[#00FFF5] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#393E46] transition inline-block">Start Your Free Trial</Link>
        </div>
      </section>
    </Layout>
  );
};

export default Home; 