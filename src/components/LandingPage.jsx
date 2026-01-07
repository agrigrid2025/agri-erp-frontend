// src/components/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// Import any shared components you want to reuse (e.g., Header, Card if you have them)
import Header from './Header';  // If you have a shared header
// import Card from './Card';   // Your dashboard widget card

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Optional shared header with logo */}
      {Header && <Header />}

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

      {/* Features Section – Reuse your dashboard card style if possible */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Example cards – copy style from your DashboardHome widgets */}
          <div className="bg-green-100 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-700">24</div>
            <div className="text-lg font-medium">Total Fields</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-700">7</div>
            <div className="text-lg font-medium">Active Sprays</div>
          </div>
          <div className="bg-purple-100 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-purple-700">18</div>
            <div className="text-lg font-medium">Team Members</div>
          </div>
          <div className="bg-yellow-100 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-700">Sunny</div>
            <div className="text-lg font-medium">Weather Today</div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-800 text-white py-16 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to transform your farm?</h2>
        <Link
          to="/app"
          className="bg-green-500 text-white font-semibold px-8 py-4 rounded-lg text-lg hover:bg-green-600 transition"
        >
          Start Now – It's Free
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;