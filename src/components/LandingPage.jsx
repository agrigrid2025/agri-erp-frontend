// src/components/LandingPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    farmName: '',
    username: '',
    password: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Replace with your actual backend endpoint for beta sign-ups
    try {
      const res = await fetch('https://api.agrigrid.net/api/beta-signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Submission failed — please try again or contact us.');
      }
    } catch (err) {
      alert('Network error — please contact info@agrigrid.net directly.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('/hero.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-green-500 opacity-10 animate-pulse"></div>
        <div className="relative text-center px-6 max-w-5xl z-10">
          <img src="/logo.png" alt="AgriGrid Logo" className="mx-auto h-24 mb-8 drop-shadow-2xl" />
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight">
            The Future of Farming <span className="text-green-400">Is Here</span>
          </h1>
          <p className="text-2xl md:text-3xl mb-10 font-light opacity-90">
            Hyper-precise tools. Real-time insights. Freshcare-ready compliance.
          </p>
          <div className="space-x-6">
            <button
              onClick={() => document.getElementById('beta-form').scrollIntoView({ behavior: 'smooth' })}
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold text-xl px-12 py-5 rounded-full transition transform hover:scale-105 shadow-2xl"
            >
              Join the Revolution – Apply for Beta
            </button>
            <Link
              to="/app"
              className="inline-block bg-transparent border-2 border-green-400 hover:bg-green-400 hover:text-black font-bold text-xl px-12 py-5 rounded-full transition"
            >
              Login for Approved Beta Users
            </Link>
          </div>
        </div>
      </section>

      {/* Expanded 6 Screenshot Cards – 3x2 grid */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-20">
            Powering the Farms of Tomorrow — <span className="text-green-400">Today</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* 1. Precise Farm Mapping */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-500 border border-green-500 border-opacity-30">
                <div className="bg-gray-700 rounded-2xl h-64 mb-6 flex items-center justify-center text-gray-500">
                  <span className="text-xl">Farm Mapping Screenshot</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">Precise Farm Mapping</h3>
                <p className="text-lg opacity-80">Draw fields, assign crops, and visualize every detail with satellite precision.</p>
              </div>
            </div>

            {/* 2. HyperLocal Weather */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-500 border border-green-500 border-opacity-30">
                <div className="bg-gray-700 rounded-2xl h-64 mb-6 flex items-center justify-center text-gray-500">
                  <span className="text-xl">Weather Forecast Screenshot</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">HyperLocal Weather Intelligence</h3>
                <p className="text-lg opacity-80">Tomorrow.io-powered pinpoint forecasts for your exact paddocks.</p>
              </div>
            </div>

            {/* 3. On-Farm Inventory */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-500 border border-green-500 border-opacity-30">
                <div className="bg-gray-700 rounded-2xl h-64 mb-6 flex items-center justify-center text-gray-500">
                  <span className="text-xl">Inventory Screenshot</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">Real-Time Inventory Control</h3>
                <p className="text-lg opacity-80">Track stock, purchases, and usage across warehouses with zero hassle.</p>
              </div>
            </div>

            {/* 4. Health & Safety Management */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-500 border border-green-500 border-opacity-30">
                <div className="bg-gray-700 rounded-2xl h-64 mb-6 flex items-center justify-center text-gray-500">
                  <span className="text-xl">Safety Screenshot</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">Health & Safety Reporting</h3>
                <p className="text-lg opacity-80">Record hazards, incidents, and manage compliance effortlessly.</p>
              </div>
            </div>

            {/* 5. Freshcare Spray Compliance */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-500 border border-green-500 border-opacity-30">
                <div className="bg-gray-700 rounded-2xl h-64 mb-6 flex items-center justify-center text-gray-500">
                  <span className="text-xl">Spray Report Screenshot</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">Freshcare Spray Compliance</h3>
                <p className="text-lg opacity-80">Automated records and reports — audit-ready in seconds.</p>
              </div>
            </div>

            {/* 6. Equipment & Team Management */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-500 border border-green-500 border-opacity-30">
                <div className="bg-gray-700 rounded-2xl h-64 mb-6 flex items-center justify-center text-gray-500">
                  <span className="text-xl">Team & Equipment Screenshot</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">Team & Equipment Tracking</h3>
                <p className="text-lg opacity-80">Manage staff, machinery, and maintenance schedules seamlessly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Application Form Section */}
      <section id="beta-form" className="py-32 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8">
            Secure Your Spot in the Beta
          </h2>
          <p className="text-2xl mb-12 opacity-90">
            Limited access — apply now and be part of the agricultural revolution.
          </p>

          {submitted ? (
            <div className="text-3xl font-bold text-green-400">
              Thank you! We'll review your application and be in touch soon.
            </div>
          ) : (
          {/* Inside the form section – replace the entire <form> block */}
          <form action="https://formspree.io/f/xrebnerj" method="POST" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input
              type="text"
              name="name"
              placeholder="First Name"
              required
              className="px-6 py-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-4 focus:ring-green-400"
            />
            <input
              type="text"
              name="surname"
              placeholder="Surname"
              required
              className="px-6 py-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-4 focus:ring-green-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="px-6 py-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-4 focus:ring-green-400"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              className="px-6 py-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-4 focus:ring-green-400"
            />
            <input
              type="text"
              name="farmName"
              placeholder="Farm Name"
              required
              className="px-6 py-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-4 focus:ring-green-400 md:col-span-2"
            />
            <input
              type="text"
              name="username"
              placeholder="Preferred Username"
              required
              className="px-6 py-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-4 focus:ring-green-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="px-6 py-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-4 focus:ring-green-400"
            />
            <button
              type="submit"
              className="md:col-span-2 bg-green-500 hover:bg-green-400 text-black font-bold text-2xl py-5 rounded-full transition transform hover:scale-105 shadow-2xl"
            >
              Apply for Beta Access
            </button>
          </form>

{/* Optional success message – Formspree redirects to a thank-you page, or use their AJAX for in-page */}
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black">
        <div className="max-w-6xl mx-auto text-center opacity-70">
          <img src="/logo.png" alt="AgriGrid" className="h-12 mx-auto mb-4" />
          <p className="text-sm mb-4">
            Questions? <a href="mailto:info@agrigrid.net" className="text-green-400 underline">info@agrigrid.net</a>
          </p>
          <p className="text-sm">© 2026 AgriGrid. Revolutionizing Australian agriculture.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;