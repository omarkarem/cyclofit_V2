import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SmoothScroll from '../components/SmoothScroll';

const FAQ = () => {
  const faqs = [
    {
      question: 'How does CycloFit analyze my cycling technique?',
      answer: 'CycloFit uses advanced computer vision technology to analyze your cycling form from videos you upload. Our AI models track key metrics like body positioning, pedal stroke efficiency, and aerodynamics to provide personalized feedback and recommendations.'
    },
    {
      question: 'What equipment do I need to use CycloFit?',
      answer: 'At minimum, you need a smartphone with a camera to record your cycling. For the best results, we recommend mounting your phone on a stable tripod positioned at a 90-degree angle to your bike, about 2-3 meters away. You can use CycloFit with any type of bicycle.'
    },
    {
      question: 'How accurate are the measurements and insights?',
      answer: 'Our technology has been validated against professional motion capture systems with a 95% accuracy rate. We continuously improve our algorithms based on data from professional cyclists and biomechanics experts to ensure the highest possible accuracy.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Yes, we take data privacy very seriously. All your videos and personal data are encrypted and stored securely. We never share your information with third parties without your explicit consent. You can delete your data at any time from your account settings.'
    },
    {
      question: 'Can I use CycloFit for indoor training?',
      answer: 'Absolutely! CycloFit works great with indoor trainers and stationary bikes. In fact, indoor sessions often provide more consistent lighting and positioning, which can lead to even more accurate analysis.'
    },
    {
      question: 'How often should I analyze my technique?',
      answer: "For best results, we recommend analyzing your technique once every 2-4 weeks when making adjustments to your form. If you're preparing for a competition or working on specific improvements, weekly analyses can help you track progress more closely."
    },
    {
      question: 'What subscription plans do you offer?',
      answer: 'We offer three subscription tiers: Basic (free, limited to 2 analyses per month), Premium ($9.99/month, unlimited analyses and basic metrics), and Pro ($19.99/month, all features including advanced metrics, training plans, and priority support).'
    },
    {
      question: 'Can I cancel my subscription at any time?',
      answer: 'Yes, you can cancel your subscription at any time through your account settings. Your access will continue until the end of your current billing period.'
    },
    {
      question: 'Do you offer team or coach accounts?',
      answer: 'Yes, we offer special team packages for cycling clubs, teams, and coaches. These include features like athlete management, comparative analytics, and bulk discounts. Contact our sales team for more information.'
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'Yes, CycloFit is available as a mobile app for both iOS and Android devices. You can download it from the App Store or Google Play Store. The mobile app allows you to record and upload videos directly and view your analytics on the go.'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = index => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <Layout>
      <SmoothScroll />
      {/* Hero Section */}
      <section className="bg-secondary bg-opacity-5 pt-36 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-dark">Frequently Asked Questions</h1>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Find answers to the most common questions about CycloFit.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0">
                <button
                  className="w-full px-6 py-4 text-left focus:outline-none flex justify-between items-center"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="text-lg font-medium text-dark">{faq.question}</span>
                  <svg
                    className={`w-6 h-6 text-primary transition-transform duration-200 ${
                      activeIndex === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`px-6 py-4 bg-secondary bg-opacity-5 transition-all duration-300 ${
                    activeIndex === index ? 'block' : 'hidden'
                  }`}
                >
                  <p className="text-secondary">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 bg-gradient-to-b from-dark to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Our support team is here to help you with any questions you may have about CycloFit.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <a
              href="/contact"
              className="px-8 py-3 bg-dark text-accent rounded-full font-medium hover:bg-primary hover:text-white transition duration-300"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@cyclofit.com"
              className="px-8 py-3 bg-transparent border-2 border-white rounded-full font-medium hover:bg-accent hover:text-dark hover:border-accent transition duration-300"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ; 