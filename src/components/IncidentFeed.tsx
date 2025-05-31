import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Incident, IncidentsResponse } from '../types/incident';
import { AlertCircle, Loader } from 'lucide-react';

const IncidentFeed: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>();

  const fetchIncidents = async (pageNum: number) => {
    try {
      const response = await fetch(`/api/incidents?page=${pageNum}&limit=20`);
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const data: IncidentsResponse = await response.json();
      
      setIncidents(prev => pageNum === 1 ? data.incidents : [...prev, ...data.incidents]);
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
    fetchIncidents(page);
  }, [page]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchIncidents(1);
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
      {incidents.map((incident, index) => (
        <div
          key={incident.id}
          ref={index === incidents.length - 1 ? lastIncidentRef : null}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transform transition-all duration-300 hover:scale-102"
        >
          <div className="flex justify-between items-start">
            <div>
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
            <div className="text-3xl">🍌</div>
          </div>
        </div>
      ))}
      
      {loading && (
        <div className="flex justify-center p-4">
          <Loader className="animate-spin text-yellow-500" />
        </div>
      )}
    </div>
  );
};

export default IncidentFeed;