import React, { useState, useEffect } from 'react';
import { Bolt } from 'lucide-react';
import Header from './components/Header';
import IncidentFeed from './components/IncidentFeed';
import Footer from './components/Footer';

function App() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [buttonSound, setButtonSound] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize sound effects
    if (typeof window !== 'undefined') {
      setButtonSound(new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'));
    }
  }, []);

  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    
    // Play button click sound if enabling sound
    if (newSoundState && buttonSound) {
      buttonSound.currentTime = 0;
      buttonSound.play().catch(() => {
        // Ignore errors from autoplay restrictions
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-yellow-50 relative overflow-x-hidden">
      {/* Banana background patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-20 top-40 text-8xl opacity-10 rotate-12">🍌</div>
        <div className="absolute -left-10 top-80 text-9xl opacity-10 -rotate-12">🍌</div>
        <div className="absolute right-10 bottom-40 text-7xl opacity-10 rotate-45">🍌</div>
        <div className="absolute left-20 bottom-20 text-8xl opacity-10 -rotate-25">🍌</div>
        <div className="absolute left-1/2 top-1/4 text-6xl opacity-5">🍌</div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-feed > div {
          opacity: 0;
          transform: translateY(20px);
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
      
      {/* Main content */}
      <Header soundEnabled={soundEnabled} toggleSound={toggleSound} />
      
      <main className="flex-grow relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-b from-yellow-200 to-yellow-100 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4">🍌 Welcome to the Slippery Zone! 🍌</h2>
            <p className="text-yellow-900">
              Ever wondered what happens when people encounter random bananas in the wild? 
              Our advanced banana monitoring system tracks slip-ups, mishaps, and banana-related 
              incidents happening across the globe in real-time! Watch as unsuspecting victims face the 
              ultimate fruit-based challenge.
            </p>
          </div>
          
          <IncidentFeed soundEnabled={soundEnabled} />
        </div>
        
        {/* Bolt.new badge */}
        <div className="fixed bottom-6 right-6 z-50">
          <a 
            href="https://bolt.new" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Bolt className="text-yellow-500" size={24} />
          </a>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;