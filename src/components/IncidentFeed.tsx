import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BananaIncident } from '../lib/supabase';
import { fetchIncidents } from '../services/api';
import { AlertCircle, Loader, RefreshCw, Database, Globe } from 'lucide-react';
import Pagination from './Pagination';

const IncidentFeed: React.FC = () => {
  const [incidents, setIncidents] = useState<BananaIncident[]>([]);
  const [allIncidents, setAllIncidents] = useState<BananaIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'supabase' | 'reddit'>('supabase');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadIncidents = async () => {
    try {
      setRefreshing(true);
      
      // Fetch a larger batch to enable proper pagination
      const data = await fetchIncidents(1, 100);
      
      setAllIncidents(data.incidents);
      setError(null);
      
      // Detect data source based on response
      if (data.incidents.length > 0) {
        const hasSupabaseIds = data.incidents.some(incident => 
          incident.id && incident.id.includes('-') && incident.id.length > 10
        );
        setDataSource(hasSupabaseIds ? 'supabase' : 'reddit');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '🍌 Banana slip! Couldn\'t load chaos. Try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update displayed incidents when page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setIncidents(allIncidents.slice(startIndex, endIndex));
  }, [allIncidents, currentPage, itemsPerPage]);

  const handleRefresh = () => {
    setCurrentPage(1);
    loadIncidents();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of the feed
    document.getElementById('incident-feed-top')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadIncidents();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const totalPages = Math.ceil(allIncidents.length / itemsPerPage);

  if (error && allIncidents.length === 0) {
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
      <div id="incident-feed-top" className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            Recent Banana Chaos
          </h2>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            {dataSource === 'supabase' ? (
              <>
                <Database size={14} className="text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Live DB</span>
              </>
            ) : (
              <>
                <Globe size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Reddit API</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && allIncidents.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={18} />
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Having trouble loading fresh chaos. Showing cached incidents.
          </p>
        </div>
      )}

      {/* Page indicator */}
      {totalPages > 1 && (
        <div className="text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {incidents.length} of {allIncidents.length} total incidents
          </span>
        </div>
      )}
      
      {incidents.map((incident, index) => (
        <div
          key={incident.id}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-102 border-l-4 border-yellow-400"
          style={{ 
            animationDelay: `${index * 50}ms`,
            animation: 'slideInFromLeft 0.5s ease-out forwards'
          }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {incident.author}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {incident.source}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                {incident.action}
              </p>
              <time className="text-sm text-gray-400 dark:text-gray-500">
                {new Date(incident.created_at).toLocaleString()}
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        theme="yellow"
      />
      
      {allIncidents.length === 0 && !loading && !error && (
        <div className="text-center p-8 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-4 block">🍌</span>
          <p className="text-lg">No banana incidents yet. Be the first to slip!</p>
        </div>
      )}
    </div>
  );
};

export default IncidentFeed;