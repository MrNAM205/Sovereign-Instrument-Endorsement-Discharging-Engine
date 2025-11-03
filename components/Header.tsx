
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-8">
      <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl tracking-wide uppercase">
        Sovereign Instrument
        <br />
        Endorsement & Discharging
        <br />
        Engine
      </h1>
      <div className="mt-8 max-w-xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            aria-label="Financial instrument number"
            placeholder="Enter Instrument Number or Text..."
            className="w-full flex-grow p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-400 focus:outline-none transition-shadow"
          />
          <button
            onClick={() => alert('Parsing functionality to be implemented.')}
            className="bg-[#1E2A3A] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#3c5472] transition-colors w-full sm:w-auto"
          >
            Parse Instrument
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
