import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { FaChartLine, FaVideo, FaDatabase, FaMobile, FaUsers, FaCalendarAlt } from 'react-icons/fa';

// Import feature images
import videoUploadImage from '../assets/images/features/Video_Upload_Interface.png';
import analysisImage from '../assets/images/features/Analysis.png';
import recommendationsImage from '../assets/images/features/Recommendations.png';

const Features = () => {
  const features = [
    {
      icon: <FaVideo className="text-5xl mb-4 text-primary" />,
      title: 'Video Analysis',
      description: 'Upload videos of your cycling and receive detailed analysis of your position, pedaling technique, and more.',
    },
    {
      icon: <FaChartLine className="text-5xl mb-4 text-primary" />,
      title: 'Performance Tracking',
      description: 'Track your progress over time and see how changes to your position and technique impact your performance.',
    },
    {
      icon: <FaDatabase className="text-5xl mb-4 text-primary" />,
      title: 'Data Insights',
      description: 'Get actionable insights based on your cycling data to improve your efficiency and prevent injuries.',
    },
    {
      icon: <FaMobile className="text-5xl mb-4 text-primary" />,
      title: 'Mobile Access',
      description: 'Access your cycling data and insights anywhere, anytime from your phone or tablet.',
    },
    {
      icon: <FaUsers className="text-5xl mb-4 text-primary" />,
      title: 'Coach Integration',
      description: 'Share your data with your coach or training partners to get expert feedback and guidance.',
    },
    {
      icon: <FaCalendarAlt className="text-5xl mb-4 text-primary" />,
      title: 'Training Plans',
      description: 'Receive personalized training plans based on your cycling data and performance goals.',
    },
  ];

  return (
    <Layout>
      <section className="bg-gradient-to-b from-dark to-secondary text-white pt-36 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Features</h1>
            <p className="text-xl md:text-2xl mb-8">
              Discover the powerful tools that make CycloFit the ultimate cycling performance platform
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-dark">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary bg-opacity-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-dark">How It Works</h2>
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-center md:text-left text-dark">Upload Your Cycling Video</h3>
                  <p className="text-secondary text-center md:text-left">
                    Record yourself cycling from the side and front, then upload the videos to our platform.
                    Our system works with any smartphone camera.
                  </p>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src={videoUploadImage} 
                    alt="Video Upload Interface" 
                    className="rounded-lg shadow-md w-full h-auto object-contain border border-gray-200"
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8 md:order-2">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-center md:text-left text-dark">AI Analysis</h3>
                  <p className="text-secondary text-center md:text-left">
                    Our advanced AI algorithms analyze your cycling technique, posture, and biomechanics in detail.
                    The system identifies areas for improvement and potential issues.
                  </p>
                </div>
                <div className="md:w-1/2 md:order-1">
                  <img 
                    src={analysisImage} 
                    alt="AI Analysis Visualization" 
                    className="rounded-lg shadow-md w-full h-auto object-contain border border-gray-200"
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-center md:text-left text-dark">Personalized Recommendations</h3>
                  <p className="text-secondary text-center md:text-left">
                    Receive detailed insights and actionable recommendations tailored to your unique cycling style.
                    Our suggestions help you optimize your position, improve efficiency, and prevent injuries.
                  </p>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src={recommendationsImage} 
                    alt="Recommendations Dashboard" 
                    className="rounded-lg shadow-md w-full h-auto object-contain border border-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Optimize Your Cycling?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of cyclists who've improved their performance, comfort, and efficiency with CycloFit.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-6 py-3 bg-dark text-accent font-bold rounded-full hover:bg-secondary transition duration-300">
              Start Your Free Trial
            </Link>
            <Link to="/pricing" className="px-6 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-accent hover:text-dark transition duration-300">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Features; 