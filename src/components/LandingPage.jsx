// src/components/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-green-600 text-white py-24 px-6 text-center">
        <h1 className="text-5xl font-bold mb-6">AgriGrid</h1>
        <p className="text-2xl mb-8">Modern Farm Management for the Future</p>
        <p className="text-xl mb-10 max-w-3xl mx-auto">
          Manage fields, sprays, inventory, equipment, safety incidents, and more — all in one powerful platform.
        </p>
        <Link
          to="/app"
          className="bg-white text-green-600 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition"
        >
          Get Started – Free Beta Access
        </Link>
      </section>

      {/* Features Section – Simple cards matching your dashboard style */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-green-100 rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl font-bold text-green-700">24</div>
            <div className="text-lg font-medium mt-2">Total Fields</div>
            <p className="text-sm text-gray-600 mt-2">Map and manage every field with precision</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl font-bold text-blue-700">7</div>
            <div className="text-lg font-medium mt-2">Active Sprays</div>
            <p className="text-sm text-gray-600 mt-2">Track applications and compliance</p>
          </div>
          <div className="bg-purple-100 rounded-lg p-6 text-center shadow-md">
            <div className="text-4xl font-bold text-purple-700">18</div>
            <div className="text-lg font-medium mt-2">Team Members</div>
            <p className="text-sm text-gray-600 mt-2">Collaborate securely across your farm</p>
          </div>
          <div className="bg-yellow-100 rounded-lg p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-yellow-700">Sunny</div>
            <div className="text-lg font-medium mt-2">Weather Today</div>
            <p className="text-sm text-gray-600 mt-2">Real-time forecasts for better decisions</p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-gray-800 text-white py-16 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to transform your farm?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join the beta today — completely free during testing.
        </p>
        <Link
          to="/app"
          className="bg-green-500 text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-green-600 transition"
        >
          Start Now – Free Access
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;