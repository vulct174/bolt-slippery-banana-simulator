import React from 'react';
import { Bolt } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 bg-yellow-100">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-yellow-800 mb-4 md:mb-0 text-center md:text-left">
          © 2025 Slippery Banana Simulator - Slip at your own risk!
        </p>
        
        <a 
          href="https://bolt.new" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow transition-all duration-300 hover:shadow-md"
        >
          <Bolt className="mr-2 text-yellow-500" size={20} />
          Made with Bolt.new
        </a>
      </div>
    </footer>
  );
};

export default Footer;