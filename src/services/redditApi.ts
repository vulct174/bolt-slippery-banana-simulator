import { RedditResponse, RedditComment, BananaIncident } from '../types/reddit';

const REDDIT_API_URL = 'https://www.reddit.com/r/SlipperyBanana/comments/1l8o3ot.json';

// Cache to store fetched data
let cachedIncidents: BananaIncident[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

const parseRedditComments = (comments: RedditComment[]): BananaIncident[] => {
  return comments
    .filter(comment => 
      comment.kind === 't1' && 
      comment.data.author && 
      comment.data.author !== '[deleted]' &&
      comment.data.body && 
      comment.data.body !== '[deleted]' &&
      comment.data.body.trim().length > 0
    )
    .map(comment => ({
      id: comment.data.id,
      author: `u/${comment.data.author}`,
      body: comment.data.body,
      timestamp: new Date(comment.data.created_utc * 1000).toISOString()
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const fetchRedditIncidents = async (): Promise<BananaIncident[]> => {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (cachedIncidents.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedIncidents;
  }

  try {
    const response = await fetch(REDDIT_API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: RedditResponse[] = await response.json();
    
    // The comments are in the second element of the array
    if (!data[1] || !data[1].data || !data[1].data.children) {
      throw new Error('Invalid Reddit API response structure');
    }
    
    const comments = data[1].data.children;
    const incidents = parseRedditComments(comments);
    
    // Update cache
    cachedIncidents = incidents;
    lastFetchTime = now;
    
    return incidents;
  } catch (error) {
    console.error('Failed to fetch Reddit data:', error);
    
    // If we have cached data, return it even if stale
    if (cachedIncidents.length > 0) {
      return cachedIncidents;
    }
    
    throw new Error('🍌 Banana slip! Couldn\'t load chaos. Try again.');
  }
};

// Paginate the incidents
export const paginateIncidents = (incidents: BananaIncident[], page: number, limit: number) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    incidents: incidents.slice(start, end),
    page,
    limit,
    total: incidents.length,
    hasMore: end < incidents.length
  };
};