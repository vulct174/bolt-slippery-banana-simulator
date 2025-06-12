import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  theme?: 'yellow' | 'purple';
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  theme = 'yellow',
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const themeClasses = {
    yellow: {
      button: 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900',
      buttonDisabled: 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed',
      pageInfo: 'text-yellow-700 dark:text-yellow-300',
      emoji: '🍌'
    },
    purple: {
      button: 'bg-purple-400 hover:bg-purple-500 text-white',
      buttonDisabled: 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed',
      pageInfo: 'text-purple-600 dark:text-purple-400',
      emoji: '🤖'
    }
  };

  const colors = themeClasses[theme];

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-4 mt-6 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 active:scale-95
          ${currentPage === 1 ? colors.buttonDisabled : colors.button}
        `}
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>

      {/* Page Info */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border-2 border-dashed ${
        theme === 'yellow' ? 'border-yellow-300 dark:border-yellow-600' : 'border-purple-300 dark:border-purple-600'
      }`}>
        <span className="text-xl animate-pulse">{colors.emoji}</span>
        <span className={`font-medium ${colors.pageInfo}`}>
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 active:scale-95
          ${currentPage === totalPages ? colors.buttonDisabled : colors.button}
        `}
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;