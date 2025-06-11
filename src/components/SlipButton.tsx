import React, { useState } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';
import Modal from './Modal';

const SAMPLE_COMMENTS = [
  "I heroically slipped on a banana while trying to save another banana. 🍌🫡",
  "Just did a triple backflip after stepping on a banana peel. 10/10 landing. 🍌🤸",
  "Banana was innocent. I was not. I slipped anyway. Justice for banana. ⚖️🍌",
  "I slipped, fell, and became one with the banana dimension. Send snacks. 🍌🚪🌌",
  "My cat slipped on the banana peel first. I followed. It's a family curse. 🐱🍌",
  "Slipped on a banana, landed in 2037. Bananas rule the world here. 🍌👑",
  "I didn't slip on a banana. The banana slipped on ME. 🍌😤",
  "Slid all the way into this subreddit. Banana chaos achieved. 🚀🍌",
  "*insert banana sound effect* – that's all I remember before hitting the floor. 🍌🔊",
  "Slipped, flipped, dipped, and now I'm equipped—with banana powers. 🍌⚡️"
];

const SlipButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const [copied, setCopied] = useState(false);

  const getRandomSuggestion = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_COMMENTS.length);
    return SAMPLE_COMMENTS[randomIndex];
  };

  const handleSlipClick = () => {
    setCurrentSuggestion(getRandomSuggestion());
    setIsModalOpen(true);
    setCopied(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCopied(false);
  };

  const handleTryAnother = () => {
    let newSuggestion;
    do {
      newSuggestion = getRandomSuggestion();
    } while (newSuggestion === currentSuggestion && SAMPLE_COMMENTS.length > 1);
    
    setCurrentSuggestion(newSuggestion);
    setCopied(false);
  };

  const handleCopyComment = async () => {
    try {
      await navigator.clipboard.writeText(currentSuggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const redditUrl = "https://www.reddit.com/r/SlipperyBanana/comments/1l8o3ot/official_banana_incident_thread_report_your_chaos/";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">
          Had a Banana Incident? 🍌
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Click below to report your slippery banana chaos!
        </p>
      </div>

      <button
        onClick={handleSlipClick}
        className="px-8 py-4 rounded-full font-bold text-xl bg-yellow-400 hover:bg-yellow-500 hover:scale-105 active:scale-95 text-yellow-900 shadow-lg hover:shadow-xl transform transition-all duration-300"
      >
        I Slipped! 🍌
      </button>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍌</div>
          <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">
            Oops! Banana Slip Detected!
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            🍌 Oops! Looks like you just slipped on a banana. Want to report it?
            <br />
            Join the chaos by commenting on the official thread below!
          </p>

          {/* Comment Suggestion Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-dashed border-yellow-300 dark:border-yellow-600 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
            
            <div className="flex items-start gap-3 mb-4">
              <div className="text-2xl animate-pulse">💭</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-300 mb-2 text-left">
                  Suggested Comment:
                </h3>
                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-inner border border-yellow-200 dark:border-yellow-700">
                  <p className="text-gray-800 dark:text-gray-200 text-left leading-relaxed font-medium">
                    {currentSuggestion}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons for suggestion */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleCopyComment}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-yellow-800 dark:text-yellow-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy comment
                  </>
                )}
              </button>
              
              <button
                onClick={handleTryAnother}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-orange-200 hover:bg-orange-300 dark:bg-orange-700 dark:hover:bg-orange-600 text-orange-800 dark:text-orange-200 transition-all duration-200"
              >
                <RefreshCw size={16} />
                Try another
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <a
              href={redditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Go to Reddit Thread 🍌
            </a>
            
            <button
              onClick={handleCloseModal}
              className="block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium py-2 px-6 rounded-full transition-colors duration-200"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SlipButton;