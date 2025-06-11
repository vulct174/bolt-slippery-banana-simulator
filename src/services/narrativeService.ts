import { supabase, BananaIncident, Narrative } from '../lib/supabase';
import { geminiService } from './geminiService';
import { redditAuth } from './redditAuth';

const SUBREDDIT = 'SlipperyBanana';
const POST_ID = '1l8o3ot';

export class NarrativeService {
  
  async getRecentIncidents(limit: number = 15): Promise<BananaIncident[]> {
    try {
      const { data, error } = await supabase
        .from('banana_incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching recent incidents:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Failed to get recent incidents:', error);
      throw error;
    }
  }

  async saveNarrative(content: string, incidentCount: number, commentId?: string): Promise<Narrative> {
    try {
      const hash = geminiService.generateContentHash(content);
      
      const { data, error } = await supabase
        .from('narratives')
        .insert({
          content,
          incident_count: incidentCount,
          comment_id: commentId,
          hash
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving narrative:', error);
        throw error;
      }

      console.log('💾 Narrative saved to database');
      return data;
    } catch (error) {
      console.error('❌ Failed to save narrative:', error);
      throw error;
    }
  }

  async checkForDuplicateNarrative(content: string): Promise<boolean> {
    try {
      const hash = geminiService.generateContentHash(content);
      
      const { data, error } = await supabase
        .from('narratives')
        .select('id')
        .eq('hash', hash)
        .limit(1);

      if (error) {
        console.error('❌ Error checking for duplicate narrative:', error);
        return false;
      }

      return (data && data.length > 0);
    } catch (error) {
      console.error('❌ Failed to check for duplicate narrative:', error);
      return false;
    }
  }

  async postNarrativeToReddit(content: string): Promise<string | null> {
    if (!redditAuth.isConfigured()) {
      console.warn('⚠️ Reddit authentication not configured. Cannot post narrative.');
      return null;
    }

    try {
      console.log('📝 Posting narrative to Reddit...');
      
      const response = await redditAuth.makeAuthenticatedRequest(
        `https://oauth.reddit.com/api/comment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            api_type: 'json',
            text: content,
            thing_id: `t3_${POST_ID}` // t3_ prefix for submissions
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.json?.errors && result.json.errors.length > 0) {
        throw new Error(`Reddit API errors: ${JSON.stringify(result.json.errors)}`);
      }

      const commentId = result.json?.data?.things?.[0]?.data?.id;
      
      if (commentId) {
        console.log('✅ Narrative posted to Reddit successfully:', commentId);
        return commentId;
      } else {
        console.warn('⚠️ Narrative posted but no comment ID returned');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to post narrative to Reddit:', error);
      return null;
    }
  }

  async generateAndPostNarrative(): Promise<{ success: boolean; narrative?: Narrative; error?: string }> {
    try {
      console.log('🎭 Starting narrative generation process...');

      // Check if Gemini is configured
      if (!geminiService.isConfigured()) {
        return { success: false, error: 'Gemini AI not configured' };
      }

      // Get recent incidents
      const incidents = await this.getRecentIncidents(15);
      
      if (incidents.length < 3) {
        console.log('📭 Not enough incidents for narrative generation (need at least 3)');
        return { success: false, error: 'Not enough incidents for narrative generation' };
      }

      // Generate narrative
      const content = await geminiService.generateNarrative(incidents);
      
      // Check for duplicates
      const isDuplicate = await this.checkForDuplicateNarrative(content);
      if (isDuplicate) {
        console.log('🔄 Generated narrative is duplicate, skipping...');
        return { success: false, error: 'Generated narrative is duplicate' };
      }

      // Post to Reddit (optional)
      let commentId: string | null = null;
      if (redditAuth.isConfigured()) {
        commentId = await this.postNarrativeToReddit(content);
      }

      // Save to database
      const narrative = await this.saveNarrative(content, incidents.length, commentId || undefined);

      console.log('🎉 Narrative generation and posting completed successfully');
      return { success: true, narrative };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Narrative generation process failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async getRecentNarratives(limit: number = 10): Promise<Narrative[]> {
    try {
      const { data, error } = await supabase
        .from('narratives')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching narratives:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Failed to get recent narratives:', error);
      throw error;
    }
  }
}

export const narrativeService = new NarrativeService();