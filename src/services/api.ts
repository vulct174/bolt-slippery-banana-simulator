import { BananaIncident } from '../types/reddit';
import { fetchRedditIncidents, paginateIncidents } from './redditApi';

// For the "I Slipped!" button - we'll add to a local array
let userIncidents: BananaIncident[] = [];
let nextId = 1;

// Simulated POST /api/incidents for user submissions
export const createIncident = async (user: string, action: string): Promise<{
  success: boolean;
  incident: BananaIncident;
}> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Validation
  if (!user || user.length < 3 || user.length > 20 || !/^[a-zA-Z0-9_]+$/.test(user)) {
    throw new Error('Invalid username');
  }
  
  if (!action || action.length > 100) {
    throw new Error('Invalid action');
  }
  
  const newIncident: BananaIncident = {
    id: `user_${nextId++}`,
    author: `u/${user}`,
    body: action,
    timestamp: new Date().toISOString()
  };
  
  userIncidents.unshift(newIncident);
  
  // Keep only last 100 user incidents
  if (userIncidents.length > 100) {
    userIncidents = userIncidents.slice(0, 100);
  }
  
  return {
    success: true,
    incident: newIncident
  };
};

// Fetch incidents combining Reddit data with user submissions
export const fetchIncidents = async (page: number = 1, limit: number = 20): Promise<{
  incidents: BananaIncident[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}> => {
  try {
    const redditIncidents = await fetchRedditIncidents();
    
    // Combine Reddit incidents with user incidents
    const allIncidents = [...userIncidents, ...redditIncidents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return paginateIncidents(allIncidents, page, limit);
  } catch (error) {
    // If Reddit fetch fails, just return user incidents
    console.warn('Reddit fetch failed, showing user incidents only:', error);
    return paginateIncidents(userIncidents, page, limit);
  }
};

// Remove simulation bot since we're using real data
export const startSimulationBot = () => {
  // No longer needed - we're using real Reddit data
  console.log('Using real Reddit data instead of simulation');
};