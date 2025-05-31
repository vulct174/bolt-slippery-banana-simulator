import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  toggleSound: () => void;
}

const Header: React.FC<HeaderProps> = ({ soundEnabled, toggleSound }) => {
  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col items-center text-center">
        <div className="flex items-center justify-center mb-2">
          <span className="text-7xl animate-bounce inline-block mr-2">🍌</span>
          <h1 className="text-4xl md:text-5xl font-bold text-brown-800 tracking-tight">
            Slippery Banana
            <span className="block md:inline md:ml-2 text-yellow-800">Simulator</span>
          </h1>
          <span className="text-7xl animate-bounce inline-block ml-2">🍌</span>
        </div>
        
        <p className="text-xl md:text-2xl text-yellow-800 font-medium mb-6 italic">
          "Watch the Banana Mayhem Unfold!"
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
          <a 
            href="https://www.reddit.com/r/gaming/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
          >
            <span className="mr-2 text-xl group-hover:animate-spin">🍌</span>
            Join the Chaos 🍌
          </a>
          
          <button 
            onClick={toggleSound}
            className="bg-white hover:bg-gray-100 text-yellow-700 font-bold py-2 px-4 rounded-full shadow transition-all duration-300 ease-in-out flex items-center"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="mr-2\" size={20} />
                Sound On
              </>
            ) : (
              <>
                <VolumeX className="mr-2" size={20} />
                Sound Off
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;