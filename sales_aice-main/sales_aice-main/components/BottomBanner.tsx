"use client";
import React, { useState } from "react";

const BottomBanner = () => {
  const [visible, setVisible] = useState(true);
  const [show, setShow] = useState(false);
  const [logoShow, setLogoShow] = useState(false);
  const [textShow, setTextShow] = useState(false);
  const [btnShow, setBtnShow] = useState(false);
  const [closeShow, setCloseShow] = useState(false);

  // Animate in on mount
  React.useEffect(() => {
    if (visible) {
      setTimeout(() => setShow(true), 50);
      setTimeout(() => setLogoShow(true), 150);
      setTimeout(() => setTextShow(true), 250);
      setTimeout(() => setBtnShow(true), 400);
      setTimeout(() => setCloseShow(true), 600);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
  className={`fixed bottom-0 left-0 w-full z-50 shadow-lg transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} bg-[#121F37] md:bg-gradient-to-r md:from-[#121F37] md:via-[#121F37] md:via-30% md:to-[#009FFF]`}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Mobile Layout */}
  <div className="flex flex-col md:hidden items-center justify-center w-full px-2 py-1 gap-1">
        <img
          src="/Logingif.gif"
          alt="Login GIF"
          className={`w-24 h-24 object-contain mb-2 transition-all duration-700 hidden md:block ${logoShow ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'}`}
          style={{ willChange: 'transform, opacity' }}
        />
        <div className={`flex flex-col items-center justify-center transition-all duration-700 ${textShow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ willChange: 'transform, opacity' }}>
          <div className="text-xs font-bold bg-yellow-400 text-black px-2 py-1 rounded mb-1 transition-all duration-700 text-center">
            FOUNDER LAUNCH OFFER - LIMITED TIME
          </div>
          <div className="text-white text-lg font-bold transition-all duration-700 text-center">
            <span className="text-yellow-400">Lifetime</span> Access $499
          </div>
          <div className="text-white text-sm transition-all duration-700 text-center">
            or <span className="font-bold text-yellow-400">$99/mo</span> Forever ($499/mo regular)
          </div>
          <div className="text-white text-xs transition-all duration-700 text-center">
            Automate Your Lead Outreach. Offer ends Sept 30,2025
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full mt-3">
          <button
            className={`bg-yellow-400 text-black font-bold px-3 py-2 rounded-lg shadow-md transition-all duration-700 hover:bg-yellow-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full text-sm ${btnShow ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'}`}
            style={{ willChange: 'transform, opacity' }}
          >
            Get Lifetime - $499
          </button>
          <button
            className={`border border-white text-white font-bold px-3 py-2 rounded-lg shadow-md transition-all duration-700 hover:bg-white hover:text-[#0E4683] hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white w-full text-sm ${btnShow ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'}`}
            style={{ willChange: 'transform, opacity' }}
          >
            Lock $99/mo
          </button>
        </div>
      </div>
      {/* Desktop Layout */}
  <div className="hidden md:flex flex-row items-center justify-between w-full px-8 py-1 gap-6">
        <img
          src="/Logingif.gif"
          alt="Login GIF"
          className={`w-44 h-28 object-contain transition-all duration-700 ${logoShow ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'}`}
          style={{ willChange: 'transform, opacity' }}
        />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className={`flex flex-col items-center justify-center transition-all duration-700 ${textShow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`} style={{ willChange: 'transform, opacity' }}>
            <div className="text-sm font-bold bg-yellow-400 text-black px-2 py-1 rounded mb-1 transition-all duration-700 text-center">
              FOUNDER LAUNCH OFFER - LIMITED TIME
            </div>
            <div className="text-white text-2xl font-bold transition-all duration-700 text-center">
              <span className="text-yellow-400">Lifetime</span> Access $499
            </div>
            <div className="text-white text-base transition-all duration-700 text-center">
              or <span className="font-bold text-yellow-400">$99/mo</span> Forever ($499/mo regular)
            </div>
            <div className="text-white text-sm transition-all duration-700 text-center">
              Automate Your Lead Outreach. Offer ends Sept 30,2025
            </div>
          </div>
        </div>
  <div className="flex flex-col gap-2 items-center w-auto mt-0">
          <button
            className={`bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg shadow-md transition-all duration-700 hover:bg-yellow-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-auto text-base ${btnShow ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'}`}
            style={{ willChange: 'transform, opacity' }}
          >
            Get Lifetime - $499
          </button>
          <button
            className={`border border-white text-white font-bold px-4 py-2 rounded-lg shadow-md transition-all duration-700 hover:bg-white hover:text-[#0E4683] hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white w-auto text-base ${btnShow ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'}`}
            style={{ willChange: 'transform, opacity' }}
          >
            Lock $99/mo
          </button>
        </div>
      </div>
      <button
        className={`absolute top-2 right-2 text-white text-xl font-bold hover:text-yellow-400 transition-all duration-700 ${closeShow ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        onClick={() => setVisible(false)}
        aria-label="Close"
        style={{ willChange: 'transform, opacity' }}
      >
        &times;
      </button>
    </div>
  );
};

export default BottomBanner;
