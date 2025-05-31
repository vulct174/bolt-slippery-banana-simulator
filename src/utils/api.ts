import { BananaIncident } from '../types';

// Simulated banana-related emojis
const bananaEmojis = ['🍌', '🐒', '🌴', '🍎', '🦍', '🏃', '💥', '🤸', '😵', '🦧'];

// Sample incident descriptions
const incidentDescriptions = [
  "slipped on a banana peel while texting and walking",
  "attempted to use a banana as a phone during a meeting",
  "mistook a yellow crayon for a banana and tried to peel it",
  "accidentally sat on a banana and ruined their favorite jeans",
  "tried to use a banana as a boomerang in the office",
  "left a banana in their car for a week, creating a mysterious smell",
  "dropped a banana smoothie on their laptop during a video call",
  "juggled 5 bananas and failed spectacularly",
  "used a banana as a microphone during karaoke night",
  "accidentally sent a banana to the laundry in their pocket"
];

// Random usernames generator
const generateUsername = (): string => {
  const prefixes = ['Banana', 'Slippery', 'Yellow', 'Monkey', 'Peeled', 'Fruity', 'Jungle'];
  const suffixes = ['Fan', 'King', 'Queen', 'Master', 'Lover', 'Ninja', 'Hero', 'Gamer'];
  const randomNumber = Math.floor(Math.random() * 1000);
  
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${randomPrefix}${randomSuffix}${randomNumber}`;
};

// Generate a random timestamp within the last 24 hours
const generateTimestamp = (): string => {
  const now = new Date();
  const randomMinutesAgo = Math.floor(Math.random() * 24 * 60); // Random minutes in last 24 hours
  now.setMinutes(now.getMinutes() - randomMinutesAgo);
  
  return now.toISOString();
};

// Generate a single random incident
const generateRandomIncident = (id: number): BananaIncident => {
  return {
    id,
    username: generateUsername(),
    timestamp: generateTimestamp(),
    description: incidentDescriptions[Math.floor(Math.random() * incidentDescriptions.length)],
    emoji: bananaEmojis[Math.floor(Math.random() * bananaEmojis.length)]
  };
};

// Simulated API call to get incidents
export const fetchBananaIncidents = (count: number = 10): Promise<BananaIncident[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const incidents: BananaIncident[] = Array.from({ length: count }, (_, i) => 
        generateRandomIncident(i + 1)
      );
      
      // Sort by timestamp (newest first)
      incidents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      resolve(incidents);
    }, 1000); // Simulate network delay
  });
};

// Simulated API call to get a new incident
export const fetchNewIncident = (): Promise<BananaIncident> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Use current timestamp for newest incident
      const newIncident = {
        id: Date.now(),
        username: generateUsername(),
        timestamp: new Date().toISOString(),
        description: incidentDescriptions[Math.floor(Math.random() * incidentDescriptions.length)],
        emoji: bananaEmojis[Math.floor(Math.random() * bananaEmojis.length)]
      };
      
      resolve(newIncident);
    }, 500);
  });
};