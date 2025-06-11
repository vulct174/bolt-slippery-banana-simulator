interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface RedditAuthConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  userAgent: string;
}

class RedditAuthService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private config: RedditAuthConfig;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_REDDIT_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_REDDIT_CLIENT_SECRET || '',
      username: import.meta.env.VITE_REDDIT_USERNAME || '',
      password: import.meta.env.VITE_REDDIT_PASSWORD || '',
      userAgent: import.meta.env.VITE_REDDIT_USER_AGENT || 'SlipperyBananaBot/0.1'
    };

    // Validate required environment variables
    if (!this.config.clientId || !this.config.clientSecret || 
        !this.config.username || !this.config.password) {
      console.warn('Reddit API credentials not configured. Using fallback to public API.');
    }
  }

  private async authenticate(): Promise<string> {
    if (!this.config.clientId) {
      throw new Error('Reddit API credentials not configured');
    }

    try {
      const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': this.config.userAgent
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: this.config.username,
          password: this.config.password
        })
      });

      if (!response.ok) {
        throw new Error(`Reddit auth failed: ${response.status} ${response.statusText}`);
      }

      const data: RedditTokenResponse = await response.json();
      
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early
      
      console.log('✅ Reddit authentication successful');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Reddit authentication failed:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Get new token
    return await this.authenticate();
  }

  async makeAuthenticatedRequest(url: string, options?: RequestInit): Promise<Response> {
    const token = await this.getAccessToken();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'User-Agent': this.config.userAgent,
      ...(options?.headers || {})
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret && 
              this.config.username && this.config.password);
  }
}

export const redditAuth = new RedditAuthService();