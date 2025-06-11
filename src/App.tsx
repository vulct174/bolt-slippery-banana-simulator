import React, { useEffect } from 'react';
import { Bolt } from 'lucide-react';
import IncidentFeed from './components/IncidentFeed';
import SlipButton from './components/SlipButton';
import { startSimulationBot } from './services/api';

function App() {
  useEffect(() => {
    // Start the simulation bot when the app loads
    startSimulationBot();
  }, []);

  const redditUrl = "https://www.reddit.com/r/SlipperyBanana/comments/1l8o3ot/official_banana_incident_thread_report_your_chaos/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-6xl animate-bounce">🍌</span>
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-900 dark:text-yellow-100 ml-4 text-center">
              Slippery Banana Simulator
            </h1>
            <span className="text-6xl animate-bounce">🍌</span>
          </div>
          <p className="text-center text-xl md:text-2xl text-yellow-800 dark:text-yellow-200 font-medium mb-6">
            Watch the Banana Mayhem Unfold!
          </p>
          <div className="flex justify-center">
            <a
              href={redditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <span className="text-xl group-hover:animate-spin">🍌</span>
              Join the Chaos 🍌
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <SlipButton />
        </div>

        <IncidentFeed />
      </main>

      <footer className="bg-yellow-100 dark:bg-yellow-800 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-center md:text-left">
            © 2025 Slippery Banana Simulator - Slip responsibly! 🍌
          </p>
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 transition-colors duration-200"
          >
            <Bolt size={20} />
            Made with Bolt.new
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;