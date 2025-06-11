import React, { useEffect, useState } from 'react';
import { Narrative } from '../lib/supabase';
import { narrativeService } from '../services/narrativeService';
import { AlertCircle, Loader, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';

const NarrativeFeed: React.FC = () => {
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadNarratives = async () => {
    try {
      setRefreshing(true);
      const data = await narrativeService.getRecentNarratives(10);
      setNarratives(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '🍌 Failed to load banana narratives!';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadNarratives();
  };

  useEffect(() => {
    loadNarratives();
    
    // Refresh every 2 minutes
    const interval = setInterval(() => {
      loadNarratives();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader className="animate-spin text-purple-500 mr-2" size={24} />
        <span className="text-purple-600 dark:text-purple-400">
          Loading AI narratives...
        </span>
      </div>
    );
  }

  if (error && narratives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <AlertCircle className="text-red-500 mb-2" size={32} />
        <p className="text-red-700 dark:text-red-400 text-center mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            AI Banana Chronicles
          </h2>
          <Sparkles className="text-purple-500" size={24} />
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-purple-400 hover:bg-purple-500 text-white px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && narratives.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={18} />
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Having trouble loading fresh narratives. Showing cached stories.
          </p>
        </div>
      )}
      
      {narratives.map((narrative, index) => (
        <div
          key={narrative.id}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl shadow-md transform transition-all duration-300 hover:scale-102 border-l-4 border-purple-400"
          style={{ 
            animationDelay: `${index * 100}ms`,
            animation: 'slideInFromLeft 0.6s ease-out forwards'
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-purple-500" size={20} />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                AI Generated Story
              </span>
              {narrative.comment_id && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                  <MessageSquare size={12} className="text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Posted</span>
                </div>
              )}
            </div>
            <div className="text-2xl animate-pulse">🤖</div>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
              {narrative.content}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>📊 {narrative.incident_count} incidents analyzed</span>
              <time>
                {new Date(narrative.created_at).toLocaleString()}
              </time>
            </div>
          </div>
        </div>
      ))}
      
      {narratives.length === 0 && !loading && !error && (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-lg">No AI narratives generated yet.</p>
          <p className="text-sm mt-2">The AI will create stories from recent banana incidents every 10 minutes!</p>
        </div>
      )}
    </div>
  );
};

export default NarrativeFeed;