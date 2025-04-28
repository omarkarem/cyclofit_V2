import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { FaCheck } from 'react-icons/fa';

const PricingPlan = ({ title, price, features, popular, buttonText }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col ${popular ? 'border-2 border-[#00ADB5] transform scale-105' : 'h-full'}`}>
      {popular && (
        <div className="bg-[#00ADB5] text-white text-center py-2 font-semibold">
          MOST POPULAR
        </div>
      )}
      <div className="p-8 flex flex-col flex-grow">
        <div>
          <h3 className="text-2xl font-bold mb-4 text-[#222832]">{title}</h3>
          <div className="mb-6">
            <span className="text-4xl font-bold text-[#222832]">${price}</span>
            <span className="text-[#393E46]">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <FaCheck className="text-[#00ADB5] mt-1 mr-2 flex-shrink-0" />
                <span className="text-[#393E46]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-auto pt-4">
          <Link
            to="/register"
            className={`block text-center py-3 px-6 rounded-lg font-semibold transition duration-300 w-full ${
              popular
                ? 'bg-[#00ADB5] text-white hover:bg-[#00FFF5] hover:text-[#222832]'
                : 'bg-[#393E46] bg-opacity-10 text-[#222832] hover:bg-opacity-20'
            }`}
          >
            {buttonText || 'Start Free Trial'}
          </Link>
        </div>
      </div>
    </div>
  );
};

const Pricing = () => {
  const plans = [
    {
      title: 'Basic',
      price: 9.99,
      features: [
        'Video analysis (2 uploads/month)',
        'Basic performance metrics',
        'Mobile app access',
        'Email support'
      ],
      popular: false
    },
    {
      title: 'Pro',
      price: 19.99,
      features: [
        'Video analysis (10 uploads/month)',
        'Advanced performance metrics',
        'Personalized recommendations',
        'Training plans',
        'Priority support'
      ],
      popular: true
    },
    {
      title: 'Elite',
      price: 39.99,
      features: [
        'Unlimited video analysis',
        'All pro features',
        'Coach integration',
        'Team management',
        'API access',
        'Dedicated support'
      ],
      popular: false,
      buttonText: 'Start Free Trial'
    }
  ];

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'Our free trial gives you full access to all features of the Pro plan for 14 days. No credit card required to start. You can cancel anytime during the trial period.'
    },
    {
      question: 'Can I change plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new rate will be charged immediately. If you downgrade, the new rate will apply at the start of your next billing cycle.'
    },
    {
      question: 'Is there a discount for annual billing?',
      answer: 'Yes, we offer a 20% discount when you choose annual billing for any of our plans. The annual amount will be charged upfront.'
    },
    {
      question: 'Do you offer team or enterprise plans?',
      answer: 'Yes, we offer special rates for teams and enterprise customers. Please contact our sales team for more information and custom pricing.'
    }
  ];

  return (
    <Layout>
      <section className="bg-gradient-to-b from-[#222832] to-[#393E46] text-white pt-36 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
            <p className="text-xl md:text-2xl mb-8">
              Choose the plan that fits your cycling goals
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((plan, index) => (
              <PricingPlan key={index} {...plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#393E46] bg-opacity-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-[#222832]">Frequently Asked Questions</h2>
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-3 text-[#222832]">{faq.question}</h3>
                  <p className="text-[#393E46]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-[#222832]">Not Sure Which Plan is Right for You?</h2>
          <p className="text-xl text-[#393E46] mb-8 max-w-3xl mx-auto">
            Start with our 14-day free trial on the Pro plan and experience all the premium features CycloFit has to offer.
          </p>
          <Link
            to="/register"
            className="px-8 py-4 bg-[#00ADB5] text-white font-bold rounded-lg hover:bg-[#00FFF5] hover:text-[#222832] transition duration-300 inline-block"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      <section className="py-16 bg-[#222832] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#00ADB5] to-[#00FFF5] rounded-2xl p-8 md:p-12 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-2/3 mb-8 md:mb-0">
                  <h2 className="text-3xl font-bold mb-4 text-[#222832]">Need a Custom Solution?</h2>
                  <p className="text-lg text-[#222832] opacity-90">
                    We offer tailored solutions for cycling teams, clubs, and coaches. Get in touch with our team to discuss your specific requirements.
                  </p>
                </div>
                <div>
                  <Link
                    to="/contact"
                    className="px-6 py-3 bg-[#222832] text-white font-bold rounded-lg hover:bg-[#393E46] transition duration-300 inline-block"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing; 