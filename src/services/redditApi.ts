import { redditAuth } from './redditAuth';
import { BananaIncident } from '../lib/supabase';

interface RedditComment {
  kind: string;
  data: {
    author: string;
    body: string;
    created_utc: number;
    id: string;
    replies?: {
      kind: string;
      data: {
        children: RedditComment[];
      };
    };
  };
}

interface RedditResponse {
  kind: string;
  data: {
    children: RedditComment[];
  };
}

const SUBREDDIT = 'SlipperyBanana';
const POST_ID = '1l8o3ot';
const PUBLIC_API_URL = `https://www.reddit.com/r/${SUBREDDIT}/comments/${POST_ID}.json`;
const OAUTH_API_URL = `https://oauth.reddit.com/comments/${POST_ID}`;

// Cache to store fetched data
let cachedIncidents: BananaIncident[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

const isValidComment = (comment: RedditComment): boolean => {
  if (comment.kind !== 't1') return false;
  if (!comment.data.author || comment.data.author === '[deleted]') return false;
  if (!comment.data.body || comment.data.body === '[deleted]') return false;
  if (comment.data.body.trim().length < 10) return false;
  
  // Filter out AutoModerator and common bot accounts
  const botNames = ['AutoModerator', 'BotDefense', 'sneakpeekbot'];
  if (botNames.includes(comment.data.author)) return false;
  
  return true;
};

const parseRedditComments = (comments: RedditComment[]): BananaIncident[] => {
  const seenComments = new Set<string>();
  
  return comments
    .filter(comment => {
      if (!isValidComment(comment)) return false;
      
      // Check for duplicates based on content
      const contentHash = `${comment.data.author}-${comment.data.body.slice(0, 50)}`;
      if (seenComments.has(contentHash)) return false;
      seenComments.add(contentHash);
      
      return true;
    })
    .map(comment => ({
      id: comment.data.id,
      author: `u/${comment.data.author}`,
      action: comment.data.body,
      created_at: new Date(comment.data.created_utc * 1000).toISOString(),
      source: 'reddit',
      reddit_id: comment.data.id
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const fetchRedditIncidents = async (): Promise<BananaIncident[]> => {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (cachedIncidents.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedIncidents;
  }

  try {
    let response: Response;
    
    // Try authenticated request first if configured
    if (redditAuth.isConfigured()) {
      console.log('🔐 Using authenticated Reddit API');
      try {
        response = await redditAuth.makeAuthenticatedRequest(OAUTH_API_URL);
      } catch (authError) {
        console.warn('⚠️ Authenticated request failed, falling back to public API:', authError);
        response = await fetch(PUBLIC_API_URL);
      }
    } else {
      console.log('🌐 Using public Reddit API');
      response = await fetch(PUBLIC_API_URL);
    }
    
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
    
    console.log(`📥 Fetched ${incidents.length} banana incidents from Reddit`);
    return incidents;
  } catch (error) {
    console.error('❌ Failed to fetch Reddit data:', error);
    
    // If we have cached data, return it even if stale
    if (cachedIncidents.length > 0) {
      console.log('📦 Returning cached data due to fetch failure');
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