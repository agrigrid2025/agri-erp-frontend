// src/components/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Farm Background */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1501439928630-6fa7b9f69e6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')`,
        }}
      >
        <div className="text-center text-white px-6 max-w-4xl">
          <img
            src="/logo.png"
            alt="AgriGrid Logo"
            className="mx-auto h-20 mb-8"
          />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            AgriGrid
          </h1>
          <p className="text-xl md:text-2xl mb-4">
            Modern Farm Management for the Future
          </p>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto opacity-90">
            Manage fields, sprays, inventory, equipment, safety, and weather — all in one powerful, easy-to-use platform designed for Australian farmers.
          </p>
          <Link
            to="/app"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-10 py-4 rounded-lg transition shadow-lg"
          >
            Get Started – Free Beta Access
          </Link>
        </div>

        {/* Optional scroll hint */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">
            Everything You Need to Run a Modern Farm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="bg-green-100 rounded-xl p-8 shadow-md hover:shadow-lg transition">
              <div className="text-5xl font-bold text-green-700 mb-3">24</div>
              <h3 className="text-xl font-semibold mb-2">Total Fields</h3>
              <p className="text-gray-600">Precise mapping and crop assignment</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-8 shadow-md hover:shadow-lg transition">
              <div className="text-5xl font-bold text-blue-700 mb-3">7</div>
              <h3 className="text-xl font-semibold mb-2">Active Sprays</h3>
              <p className="text-gray-600">Plan, record, and report with compliance</p>
            </div>
            <div className="bg-purple-100 rounded-xl p-8 shadow-md hover:shadow-lg transition">
              <div className="text-5xl font-bold text-purple-700 mb-3">18</div>
              <h3 className="text-xl font-semibold mb-2">Team Members</h3>
              <p className="text-gray-600">Secure collaboration across your operation</p>
            </div>
            <div className="bg-yellow-100 rounded-xl p-8 shadow-md hover:shadow-lg transition">
              <div className="text-4xl font-bold text-yellow-700 mb-3">Sunny</div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Weather</h3>
              <p className="text-gray-600">Accurate forecasts for better decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to simplify your farm management?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join the beta today — completely free. No credit card required.
          </p>
          <Link
            to="/app"
            className="inline-block bg-white text-green-700 hover:bg-gray-100 font-bold text-lg px-10 py-4 rounded-lg transition shadow-lg"
          >
            Start Free Beta Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <img src="/logo.png" alt="AgriGrid" className="h-10 mx-auto mb-4 opacity-70" />
          <p className="text-sm">
            © 2026 AgriGrid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;