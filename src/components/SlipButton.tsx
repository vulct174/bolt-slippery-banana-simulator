import React, { useState, useEffect } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { createIncident } from '../services/api';

const generateRandomUsername = () => {
  const prefix = "BananaPro";
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${random}`;
};

const slipActions = [
  "slipped on a banana peel while texting!",
  "tried to use a banana as a phone during a meeting!",
  "mistook a yellow crayon for a banana and tried to peel it!",
  "accidentally sat on a banana and ruined their favorite jeans!",
  "tried to use a banana as a boomerang in the office!",
  "dropped a banana smoothie on their laptop during a video call!",
  "juggled 5 bananas and failed spectacularly!",
  "used a banana as a microphone during karaoke night!",
  "slipped while doing the banana dance!",
  "got tangled in banana peels while grocery shopping!"
];

const SlipButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSlip = async () => {
    if (cooldown > 0 || isLoading) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const randomAction = slipActions[Math.floor(Math.random() * slipActions.length)];
      await createIncident(generateRandomUsername(), randomAction);
      setFeedback({ type: 'success', message: 'Your banana incident has been recorded! 🍌' });
      setCooldown(5);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record slip. Try again!';
      setFeedback({ type: 'error', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">
          Add Your Own Banana Chaos!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Click the button to report your own slippery banana incident
        </p>
      </div>

      <button
        onClick={handleSlip}
        disabled={isLoading || cooldown > 0}
        className={`
          px-8 py-4 rounded-full font-bold text-xl
          transform transition-all duration-300
          ${isLoading || cooldown > 0
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-yellow-400 hover:bg-yellow-500 hover:scale-105 active:scale-95 text-yellow-900 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-900"></div>
            Recording Chaos...
          </span>
        ) : cooldown > 0 ? (
          `Wait ${cooldown}s`
        ) : (
          'I Slipped! 🍌'
        )}
      </button>

      {feedback && (
        <div className={`
          flex items-center gap-2 p-3 rounded-lg transition-all duration-300 max-w-md text-center
          ${feedback.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
          }
        `}>
          {feedback.type === 'success' ? (
            <Check size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default SlipButton;