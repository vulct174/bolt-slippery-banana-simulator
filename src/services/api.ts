import { Incident } from '../types/incident';

// Simulated in-memory storage
let incidents: Incident[] = [];
let nextId = 1;

// Generate random usernames
const generateUsername = () => {
  const adjectives = ["Slippery", "Banana", "Yellow", "Peeled", "Tropical", "Fruity", "Smooth"];
  const nouns = ["Master", "Ninja", "Pro", "Expert", "King", "Queen", "Hero", "Legend"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}_${num}`;
};

// Slip actions for simulation
const slipActions = [
  "slipped on a banana peel while dancing",
  "tried to juggle bananas and failed spectacularly",
  "mistook a banana for a phone",
  "used a banana as a boomerang",
  "attempted to eat a plastic banana",
  "slipped while doing the banana dance",
  "got tangled in banana peels",
  "tried to surf on a giant banana",
  "slipped during a banana eating contest",
  "fell while chasing a runaway banana"
];

// Initialize with some sample data
const initializeData = () => {
  if (incidents.length === 0) {
    for (let i = 0; i < 10; i++) {
      incidents.push({
        id: `${nextId++}`,
        user: generateUsername(),
        action: slipActions[Math.floor(Math.random() * slipActions.length)],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulated GET /api/incidents
export const fetchIncidents = async (page: number = 1, limit: number = 20): Promise<{
  incidents: Incident[];
  page: number;
  limit: number;
  total: number;
}> => {
  initializeData();
  await delay(300); // Simulate network delay
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const sortedIncidents = [...incidents].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return {
    incidents: sortedIncidents.slice(start, end),
    page,
    limit,
    total: incidents.length
  };
};

// Simulated POST /api/incidents
export const createIncident = async (user: string, action: string): Promise<{
  success: boolean;
  incident: Incident;
}> => {
  await delay(500); // Simulate network delay
  
  // Validation
  if (!user || user.length < 3 || user.length > 20 || !/^[a-zA-Z0-9_]+$/.test(user)) {
    throw new Error('Invalid username');
  }
  
  if (!action || action.length > 100) {
    throw new Error('Invalid action');
  }
  
  const newIncident: Incident = {
    id: `${nextId++}`,
    user,
    action,
    timestamp: new Date().toISOString()
  };
  
  incidents.unshift(newIncident);
  
  // Keep only last 1000 incidents
  if (incidents.length > 1000) {
    incidents = incidents.slice(0, 1000);
  }
  
  return {
    success: true,
    incident: newIncident
  };
};

// Simulation bot - generates incidents periodically
export const startSimulationBot = () => {
  const generateSimulatedIncident = () => {
    const newIncident: Incident = {
      id: `${nextId++}`,
      user: generateUsername(),
      action: slipActions[Math.floor(Math.random() * slipActions.length)],
      timestamp: new Date().toISOString()
    };
    
    incidents.unshift(newIncident);
    
    // Keep only last 1000 incidents
    if (incidents.length > 1000) {
      incidents = incidents.slice(0, 1000);
    }
    
    console.log(`[Simulation] New incident: ${newIncident.user} ${newIncident.action}`);
  };
  
  // Generate initial incident after 5 seconds
  setTimeout(generateSimulatedIncident, 5000);
  
  // Then generate every 15 seconds
  setInterval(generateSimulatedIncident, 15000);
};