import React, { useState, useEffect } from 'react';
import { AlertCircle, Check } from 'lucide-react';

const generateRandomUsername = () => {
  const prefix = "BananaPro";
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${random}`;
};

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
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: generateRandomUsername(),
          action: "slipped on a banana peel!"
        })
      });

      if (!response.ok) throw new Error('Failed to record slip');

      setFeedback({ type: 'success', message: 'Slip recorded successfully!' });
      setCooldown(5);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to record slip. Try again!' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleSlip}
        disabled={isLoading || cooldown > 0}
        className={`
          px-6 py-3 rounded-full font-bold text-lg
          transform transition-all duration-300
          ${isLoading || cooldown > 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-yellow-400 hover:bg-yellow-500 hover:scale-105 active:scale-95'
          }
        `}
      >
        {cooldown > 0 ? `Wait ${cooldown}s` : 'I Slipped! 🍌'}
      </button>

      {feedback && (
        <div className={`
          flex items-center gap-2 p-2 rounded-lg
          ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
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