import React from 'react';
import { Bolt } from 'lucide-react';
import IncidentFeed from './components/IncidentFeed';
import SlipButton from './components/SlipButton';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-yellow-400 dark:bg-yellow-600 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-4">
            <span className="text-6xl">🍌</span>
            <h1 className="text-4xl font-bold text-yellow-900 dark:text-yellow-100 ml-4">
              Slippery Banana Simulator
            </h1>
          </div>
          <p className="text-center text-xl text-yellow-800 dark:text-yellow-200">
            Watch the Banana Mayhem Unfold!
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <SlipButton />
        </div>

        <IncidentFeed />
      </main>

      <footer className="bg-yellow-100 dark:bg-yellow-800 py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <p className="text-yellow-800 dark:text-yellow-200">
            © 2025 Slippery Banana Simulator
          </p>
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100"
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