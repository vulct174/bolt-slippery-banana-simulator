import React, { useState } from 'react';
import Modal from './Modal';

const SlipButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSlipClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
          <div className="text-6xl mb-4">🍌</div>
          <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">
            Oops! Banana Slip Detected!
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            🍌 Oops! Looks like you just slipped on a banana. Want to report it?
            <br />
            Join the chaos by commenting on the official thread below!
          </p>
          
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