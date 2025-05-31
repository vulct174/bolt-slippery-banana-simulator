import React, { useEffect, useState } from 'react';
import { BananaIncident } from '../types';
import { fetchBananaIncidents, fetchNewIncident } from '../utils/api';
import IncidentCard from './IncidentCard';

interface IncidentFeedProps {
  soundEnabled: boolean;
}

const IncidentFeed: React.FC<IncidentFeedProps> = ({ soundEnabled }) => {
  const [incidents, setIncidents] = useState<BananaIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slipSound] = useState<HTMLAudioElement | null>(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2954/2954-preview.mp3');
      audio.volume = 0.5;
      return audio;
    }
    return null;
  });

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        setLoading(true);
        const data = await fetchBananaIncidents(8);
        setIncidents(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch banana incidents. The bananas are too slippery!');
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const newIncident = await fetchNewIncident();
        setIncidents(prevIncidents => [newIncident, ...prevIncidents.slice(0, 9)]);
        
        if (soundEnabled && slipSound) {
          slipSound.currentTime = 0;
          slipSound.play().catch(() => {
            // Ignore errors from autoplay restrictions
          });
        }
      } catch (err) {
        console.error('Error fetching new incident:', err);
      }
    }, 5000); // New incident every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [soundEnabled, slipSound]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="text-6xl animate-spin">🍌</div>
        <p className="mt-4 text-lg text-yellow-800 font-medium">Loading banana incidents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Oh no! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-yellow-800 mb-6 text-center">Live Banana Incident Feed</h2>
      
      <div className="space-y-4 animate-feed">
        {incidents.map((incident, index) => (
          <IncidentCard key={incident.id} incident={incident} index={index} />
        ))}
      </div>
    </div>
  );
};

export default IncidentFeed;