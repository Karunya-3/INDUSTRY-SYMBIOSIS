import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

const LandingPage = () => {
  const features = [
    {
      icon: '♻️',
      title: 'Reduce Waste',
      description: 'Find new uses for your industrial by-products and reduce landfill waste.'
    },
    {
      icon: '💰',
      title: 'Save Money',
      description: 'Turn waste into revenue streams and reduce disposal costs.'
    },
    {
      icon: '🌱',
      title: 'Sustainable',
      description: 'Contribute to a circular economy and reduce your environmental impact.'
    },
    {
      icon: '🤝',
      title: 'Connect',
      description: 'Build valuable partnerships with other businesses in your region.'
    }
  ];
  
  const steps = [
    {
      number: '1',
      title: 'Register Your Company',
      description: 'Sign up as a factory or business and provide your company details.'
    },
    {
      number: '2',
      title: 'List Resources or Wastes',
      description: 'Post what you have to offer or what you need for your operations.'
    },
    {
      number: '3',
      title: 'Get Matched',
      description: 'Our AI algorithm finds the best matches for your materials.'
    },
    {
      number: '4',
      title: 'Connect & Collaborate',
      description: 'Connect with matched partners and start your symbiosis journey.'
    }
  ];
  
  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Turn Waste into Resources
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Connect with businesses to exchange industrial by-products, reduce waste, 
              and create a circular economy. Join the sustainable revolution today.
            </p>
            <div className="space-x-4">
              <Link to="/register">
                <Button size="lg" variant="primary">Get Started</Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Industrial Symbiosis?
            </h2>
            <p className="text-xl text-gray-600">
              Transform your industrial waste into valuable resources
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start your circular economy journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-blue-200">
                    <div className="absolute right-0 -top-2 w-4 h-4 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LandingPage;