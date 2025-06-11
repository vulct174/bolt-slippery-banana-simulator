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

export interface BananaIncident {
  id: string;
  author: string;
  body: string;
  timestamp: string;
}