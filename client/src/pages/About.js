import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SmoothScroll from '../components/SmoothScroll';

const About = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      bio: 'Former professional cyclist with a passion for technology and innovation.',
      image: '/images/team/sarah.jpg'
    },
    {
      name: 'David Chen',
      role: 'CTO',
      bio: 'Computer vision expert with 10+ years of experience in sports tech.',
      image: '/images/team/david.jpg'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Product',
      bio: 'Product designer who has worked with Olympic athletes to optimize performance.',
      image: '/images/team/michael.jpg'
    },
    {
      name: 'Emily Taylor',
      role: 'Lead Developer',
      bio: 'Full-stack developer specializing in real-time analytics and performance tracking.',
      image: '/images/team/emily.jpg'
    }
  ];

  return (
    <Layout>
      <SmoothScroll />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#222832] to-[#393E46] text-white pt-36 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About CycloFit</h1>
            <p className="text-xl md:text-2xl mb-8">Revolutionizing cycling performance through AI-powered analysis</p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-[#222832]">Our Story</h2>
            <div className="prose prose-lg mx-auto">
              <p className="mb-4 text-[#393E46]">
                CycloFit was founded in 2021 by a team of passionate cyclists, data scientists, and sports physiologists
                who shared a common vision: to make professional-level cycling analysis accessible to everyone.
              </p>
              <p className="mb-4 text-[#393E46]">
                Our journey began when our founder, an avid cyclist, experienced a recurring knee injury that multiple bike
                fitting sessions couldn't resolve. After consulting with sports scientists and machine learning experts,
                he realized that traditional bike fitting methods lacked the precision and personalization that advanced
                computer vision technology could provide.
              </p>
              <p className="mb-8 text-[#393E46]">
                This insight led to the development of CycloFit's proprietary AI system that analyzes cycling posture, pedal
                stroke efficiency, and body mechanics with unprecedented accuracy—all from a simple smartphone video.
              </p>

              <h3 className="text-2xl font-bold mb-4 text-[#222832]">Our Mission</h3>
              <p className="mb-8 text-[#393E46]">
                Our mission is to democratize access to elite-level cycling analysis and training insights. We believe that
                every cyclist, regardless of their experience or resources, deserves access to the tools that can help them
                ride more efficiently, comfortably, and injury-free.
              </p>

              <h3 className="text-2xl font-bold mb-4 text-[#222832]">Our Approach</h3>
              <p className="mb-4 text-[#393E46]">
                At CycloFit, we combine cutting-edge AI technology with sports science expertise to provide comprehensive,
                accurate, and actionable insights about your cycling technique. Our approach is:
              </p>
              <ul className="list-disc pl-6 mb-8">
                <li className="mb-2 text-[#393E46]">
                  <strong className="text-[#222832]">Data-driven:</strong> We use advanced computer vision algorithms to capture thousands of data points
                  from your cycling videos.
                </li>
                <li className="mb-2 text-[#393E46]">
                  <strong className="text-[#222832]">Personalized:</strong> Our recommendations are tailored to your unique body proportions, flexibility,
                  and cycling goals.
                </li>
                <li className="mb-2 text-[#393E46]">
                  <strong className="text-[#222832]">Accessible:</strong> No expensive equipment or in-person appointments required—just your smartphone and
                  our app.
                </li>
                <li className="mb-2 text-[#393E46]">
                  <strong className="text-[#222832]">Actionable:</strong> We don't just provide data—we translate our analysis into clear, practical
                  adjustments you can make immediately.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      <section className="py-16 bg-[#00ADB5] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Cycling?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of cyclists who've improved their performance, comfort, and efficiency with CycloFit.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="px-6 py-3 bg-[#222832] text-[#00FFF5] font-bold rounded-full hover:bg-[#393E46] transition duration-300">
              Start Your Free Trial
            </Link>
            <Link to="/features" className="px-6 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-[#00FFF5] hover:text-[#222832] transition duration-300">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About; 