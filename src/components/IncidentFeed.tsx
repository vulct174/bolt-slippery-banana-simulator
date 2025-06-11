import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BananaIncident } from '../types/reddit';
import { fetchIncidents } from '../services/api';
import { AlertCircle, Loader, RefreshCw } from 'lucide-react';

const IncidentFeed: React.FC = () => {
  const [incidents, setIncidents] = useState<BananaIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const observer = useRef<IntersectionObserver>();

  const loadIncidents = async (pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 1 && !append) {
        setRefreshing(true);
      }
      
      const data = await fetchIncidents(pageNum, 20);
      
      setIncidents(prev => append ? [...prev, ...data.incidents] : data.incidents);
      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '🍌 Banana slip! Couldn\'t load chaos. Try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const lastIncidentRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleRefresh = () => {
    setPage(1);
    loadIncidents(1, false);
  };

  useEffect(() => {
    if (page === 1) {
      loadIncidents(1, false);
    } else {
      loadIncidents(page, true);
    }
  }, [page]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadIncidents(1, false);
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (error && incidents.length === 0) {
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
        <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          Recent Banana Chaos from Reddit
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && incidents.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={18} />
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Having trouble loading fresh chaos. Showing cached incidents.
          </p>
        </div>
      )}
      
      {incidents.map((incident, index) => (
        <div
          key={incident.id}
          ref={index === incidents.length - 1 ? lastIncidentRef : null}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-102 border-l-4 border-yellow-400"
          style={{ 
            animationDelay: `${index * 50}ms`,
            animation: 'slideInFromLeft 0.5s ease-out forwards'
          }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                {incident.author}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                {incident.body}
              </p>
              <time className="text-sm text-gray-400 dark:text-gray-500">
                {new Date(incident.timestamp).toLocaleString()}
              </time>
            </div>
            <div className="text-3xl ml-4 animate-bounce">🍌</div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="flex justify-center items-center p-6">
          <Loader className="animate-spin text-yellow-500 mr-2" size={24} />
          <span className="text-yellow-600 dark:text-yellow-400">
            Loading banana chaos...
          </span>
        </div>
      )}
      
      {!hasMore && incidents.length > 0 && (
        <div className="text-center p-4 text-gray-500 dark:text-gray-400">
          <span className="text-2xl">🍌</span>
          <p className="mt-2">No more banana incidents to load!</p>
        </div>
      )}

      {incidents.length === 0 && !loading && !error && (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-4 block">🍌</span>
          <p className="text-lg">No banana incidents yet. Be the first to slip!</p>
        </div>
      )}
    </div>
  );
};

export default IncidentFeed;