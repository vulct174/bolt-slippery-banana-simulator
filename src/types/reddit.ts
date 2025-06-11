export interface RedditComment {
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

export interface RedditResponse {
  kind: string;
  data: {
    children: RedditComment[];
  };
}

// Re-export BananaIncident from supabase lib
export type { BananaIncident } from '../lib/supabase';