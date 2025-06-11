import React from 'react';

const BoltBadge: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform duration-300 hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
        aria-label="Made with Bolt.new"
      >
        <img
          src="/white_circle_360x360.png"
          alt="Bolt.new Badge"
          className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
          loading="lazy"
        />
      </a>
    </div>
  );
};

export default BoltBadge;