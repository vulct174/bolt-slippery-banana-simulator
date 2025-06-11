import { supabase, BananaIncident, Narrative } from '../lib/supabase';
import { geminiService } from './geminiService';

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
    try {
      console.log('📝 Posting narrative to Reddit via Edge Function...');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/post-reddit-comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post to Reddit');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Narrative posted to Reddit successfully:', result.commentId);
        return result.commentId;
      } else {
        console.warn('⚠️ Reddit posting failed:', result.error);
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

      console.log(`📊 Found ${incidents.length} recent incidents for narrative generation`);

      // Generate narrative
      const content = await geminiService.generateNarrative(incidents);
      
      // Check for duplicates
      const isDuplicate = await this.checkForDuplicateNarrative(content);
      if (isDuplicate) {
        console.log('🔄 Generated narrative is duplicate, skipping...');
        return { success: false, error: 'Generated narrative is duplicate' };
      }

      // Post to Reddit
      const commentId = await this.postNarrativeToReddit(content);

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