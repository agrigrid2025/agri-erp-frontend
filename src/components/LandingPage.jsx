// src/components/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section – Uses local /hero.jpg */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/hero.jpg')`,
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
            Powerful tools for field mapping, inventory, safety, weather, and compliance — all in one easy-to-use platform designed for Australian farmers.
          </p>
          <Link
            to="/app"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-10 py-4 rounded-lg transition shadow-lg"
          >
            Get Started – Free Beta Access
          </Link>
        </div>
      </section>

      {/* Features Section – Now 5 cards including Freshcare Compliance */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">
            Everything You Need to Run a Modern Farm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* 1. Precise Field Mapping */}
            <div className="bg-green-100 rounded-xl p-8 shadow-md hover:shadow-lg transition">
              <div className="text-5xl font-bold text-green-700 mb-3">24</div>
              <h3 className="text-xl font-semibold mb-2">Precise Field Mapping</h3>
              <p className="text-gray-600">Map fields, assign crops, and plan with accuracy</p>
            </div>

            {/* 2. HyperLocal Weather */}
            <div className="bg-blue-100 rounded-xl p-8 shadow-md hover:shadow-lg transition">
              <div className="text-2xl font-bold text-blue-700 mb-3">Powered by Tomorrow.io</div>
              <h3 className="text-xl font-semibold mb-2">Live HyperLocal Weather</h3>
              <p className="text-gray-600">Pinpoint forecasts for your exact location</p>
            </div>

            {/* 3. On-Farm Inventory */}
            <div className="bg-purple-100 rounded-xl p-8 shadow-md hover:shadow-lg transition">
              <div className="text-5xl font-bold text-purple-700 mb-3">Full Control</div>
              <h3 className="text-xl font-semibold mb-2">On-Farm Inventory</h3>
              <p className="text-gray-600">Track stock, suppliers, and purchases in real time</p>
            </div>

            {/* 4. Health & Safety */}
            <div className="bg-yellow-100 rounded-xl p-8 shadow-md hover:shadow-lg transition">
              <div className="text-4xl font-bold text-yellow-700 mb-3">Safe & Compliant</div>
              <h3 className="text-xl font-semibold mb-2">Health & Safety Management</h3>
              <p className="text-gray-600">Record hazards, incidents, and reports easily</p>
            </div>

            {/* 5. Freshcare Spray Compliance – New Card */}
            <div className="bg-teal-100 rounded-xl p-8 shadow-md hover:shadow-lg transition">
              <div className="text-4xl font-bold text-teal-700 mb-3">Freshcare Ready</div>
              <h3 className="text-xl font-semibold mb-2">Spray Compliance & Reporting</h3>
              <p className="text-gray-600">Automated records and reports for Freshcare certification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-700 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your farm operations?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join the beta today — completely free during testing.
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