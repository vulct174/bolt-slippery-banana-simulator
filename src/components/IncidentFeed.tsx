import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Incident } from '../types/incident';
import { fetchIncidents } from '../services/api';
import { AlertCircle, Loader } from 'lucide-react';

const IncidentFeed: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>();

  const loadIncidents = async (pageNum: number, append: boolean = false) => {
    try {
      const data = await fetchIncidents(pageNum, 20);
      
      setIncidents(prev => append ? [...prev, ...data.incidents] : data.incidents);
      setHasMore(data.incidents.length === data.limit);
      setError(null);
    } catch (err) {
      setError('Failed to load incidents. Please try again later.');
    } finally {
      setLoading(false);
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
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
        <AlertCircle className="text-red-500 mr-2" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">
        Recent Banana Incidents
      </h2>
      
      {incidents.map((incident, index) => (
        <div
          key={incident.id}
          ref={index === incidents.length - 1 ? lastIncidentRef : null}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-102 animate-in slide-in-from-top-2"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {incident.user}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {incident.action}
              </p>
              <time className="text-sm text-gray-400 dark:text-gray-500">
                {new Date(incident.timestamp).toLocaleString()}
              </time>
            </div>
            <div className="text-3xl animate-bounce">🍌</div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="flex justify-center p-4">
          <Loader className="animate-spin text-yellow-500" size={24} />
          <span className="ml-2 text-yellow-600">Loading more incidents...</span>
        </div>
      )}
      
      {!hasMore && incidents.length > 0 && (
        <div className="text-center p-4 text-gray-500">
          No more incidents to load
        </div>
      )}
    </div>
  );
};

export default IncidentFeed;