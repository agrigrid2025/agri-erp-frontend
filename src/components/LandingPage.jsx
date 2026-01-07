// src/components/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Cutting-Edge Hero – Full bleed, parallax feel, hype copy */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('/hero.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-green-500 opacity-10 animate-pulse"></div> {/* Subtle futuristic glow */}
        <div className="relative text-center px-6 max-w-5xl z-10">
          <img
            src="/logo.png"
            alt="AgriGrid Logo"
            className="mx-auto h-24 mb-8 drop-shadow-2xl"
          />
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight">
            The Future of Farming <span className="text-green-400">Is Here</span>
          </h1>
          <p className="text-2xl md:text-3xl mb-10 font-light opacity-90">
            Hyper-precise tools. Real-time insights. Freshcare-ready compliance. Built for the next generation of Australian farmers.
          </p>
          <div className="space-x-6">
            <Link
              to="/app"
              className="inline-block bg-green-500 hover:bg-green-400 text-black font-bold text-xl px-12 py-5 rounded-full transition transform hover:scale-105 shadow-2xl"
            >
              Join the Revolution – Free Beta Access
            </Link>
          </div>
          <p className="mt-8 text-lg opacity-80">
            Limited spots • Be one of the first to transform your farm
          </p>
        </div>
      </section>

      {/* Hype Features – Screenshot-style previews with glow */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-20">
            Powering the Farms of Tomorrow — <span className="text-green-400">Today</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1: Dashboard Preview */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-500 border border-green-500 border-opacity-30">
                <img
                  src="https://miro.medium.com/v2/resize:fit:2000/1*JFwtXPPDjKlJaZ9y_UyewQ.png"  // Modern agtech dashboard
                  alt="AgriGrid Cutting-Edge Dashboard"
                  className="rounded-2xl shadow-xl mb-6"
                />
                <h3 className="text-3xl font-bold mb-4">Intuitive Command Center</h3>
                <p className="text-lg opacity-80">Everything at your fingertips — fields, weather, inventory, safety — in one stunning interface.</p>
              </div>
            </div>

            {/* Feature 2: Weather + Compliance */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-500 border border-green-500 border-opacity-30">
                <img
                  src="https://play-lh.googleusercontent.com/ktSdMLd5SflXYweKszBWjjLt8Z_xvwKtH_0q8htX7rFG8rGDewkV-BkiioqbjEtctNWJ=w526-h296-rw"  // Hyperlocal weather app
                  alt="HyperLocal Weather Powered by Tomorrow.io"
                  className="rounded-2xl shadow-xl mb-6"
                />
                <h3 className="text-3xl font-bold mb-4">HyperLocal Intelligence</h3>
                <p className="text-lg opacity-80">Tomorrow.io-powered forecasts + automated Freshcare spray compliance. Never guess again.</p>
              </div>
            </div>

            {/* Feature 3: Inventory & Safety */}
            <div className="group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl transform group-hover:scale-105 transition duration-500 border border-green-500 border-opacity-30">
                <img
                  src="https://agtech.folio3.com/wp-content/uploads/2023/03/agriwebb.png"  // Inventory screenshot
                  alt="Real-Time Inventory & Safety Reporting"
                  className="rounded-2xl shadow-xl mb-6"
                />
                <h3 className="text-3xl font-bold mb-4">Total Control & Peace of Mind</h3>
                <p className="text-lg opacity-80">Track every item, stay compliant, and keep your team safe — effortlessly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Beta Call – High hype */}
      <section className="py-32 px-6 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-8">
            The Future Starts Now
          </h2>
          <p className="text-2xl mb-12 opacity-90">
            Be among the first farmers revolutionizing agriculture with AgriGrid.
          </p>
          <p className="text-3xl font-bold mb-12 bg-black bg-opacity-50 inline-block py-6 px-12 rounded-2xl">
            To join the exclusive beta program, email <a href="mailto:info@agrigrid.net" className="text-green-300 underline">info@agrigrid.net</a> today
          </p>
          <Link
            to="/app"
            className="inline-block bg-black hover:bg-gray-900 text-green-400 font-bold text-2xl px-16 py-6 rounded-full transition transform hover:scale-110 shadow-2xl"
          >
            Claim Your Spot – Free Beta Access
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black">
        <div className="max-w-6xl mx-auto text-center opacity-70">
          <img src="/logo.png" alt="AgriGrid" className="h-12 mx-auto mb-4" />
          <p className="text-sm">© 2026 AgriGrid. Revolutionizing Australian agriculture.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;