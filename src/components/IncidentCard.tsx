import React from 'react';
import { BananaIncident } from '../types';
import { formatTimestamp } from '../utils/format';

interface IncidentCardProps {
  incident: BananaIncident;
  index: number;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, index }) => {
  const animationDelay = `${index * 0.1}s`;
  
  return (
    <div 
      className="bg-white rounded-lg shadow-lg p-4 mb-4 transform hover:scale-102 hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500"
      style={{ 
        animationDelay, 
        animation: 'slideIn 0.5s ease-out forwards',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-lg md:text-xl font-bold text-yellow-800" style={{ fontFamily: 'Comic Sans MS, cursive, sans-serif' }}>
              {incident.username}
            </h3>
            <span className="text-gray-500 text-sm ml-3">
              {formatTimestamp(incident.timestamp)}
            </span>
          </div>
          <p className="text-gray-700 mt-2 text-base">
            {incident.description}
          </p>
        </div>
        <div className="text-4xl ml-4 transform hover:scale-125 hover:rotate-12 transition-all duration-300">
          {incident.emoji}
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;