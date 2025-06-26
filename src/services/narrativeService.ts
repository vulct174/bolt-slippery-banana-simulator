import { supabase, BananaIncident, Narrative } from '../lib/supabase';
import { geminiService } from './geminiService';
import { botSettingsService } from './botSettingsService';

const SUBREDDIT = 'SlipperyBanana';
const POST_ID = '1l8o3ot';

// Rate limiting state
let lastPostTime = 0;
const MIN_POST_INTERVAL = 10000; // 10 seconds minimum between posts
const RATE_LIMIT_COOLDOWN = 60000; // 1 minute cooldown after rate limit

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

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastPost = now - lastPostTime;
    
    if (timeSinceLastPost < MIN_POST_INTERVAL) {
      const waitTime = MIN_POST_INTERVAL - timeSinceLastPost;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms before posting...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  private isRateLimitError(error: any): boolean {
    if (typeof error === 'string') {
      return error.includes('RATELIMIT') || error.includes('rate limit');
    }
    if (error.message) {
      return error.message.includes('RATELIMIT') || error.message.includes('rate limit');
    }
    return false;
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 5000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (this.isRateLimitError(error)) {
          console.warn(`⚠️ Rate limit hit on attempt ${attempt + 1}/${maxRetries + 1}`);
          if (attempt < maxRetries) {
            // For rate limits, wait longer
            const rateLimitDelay = Math.max(baseDelay * 2, 10000); // At least 10 seconds
            console.log(`⏳ Rate limit cooldown: waiting ${rateLimitDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
          }
        } else {
          // For non-rate-limit errors, don't retry
          console.error(`❌ Non-rate-limit error, not retrying:`, error);
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  async postNarrativeToReddit(content: string): Promise<string | null> {
    try {
      console.log('📝 Preparing to post narrative to Reddit...');
      
      // Check rate limiting before attempting
      await this.waitForRateLimit();
      
      const postOperation = async (): Promise<string | null> => {
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
          lastPostTime = Date.now(); // Update last post time on success
          console.log('✅ Narrative posted to Reddit successfully:', result.commentId);
          return result.commentId;
        } else {
          throw new Error(result.error || 'Reddit posting failed');
        }
      };

      // Use retry logic with exponential backoff
      return await this.retryWithBackoff(postOperation, 3, 5000);
      
    } catch (error) {
      console.error('❌ Failed to post narrative to Reddit after retries:', error);
      
      // Check if it's a rate limit error and provide helpful message
      if (this.isRateLimitError(error)) {
        console.warn('⚠️ Reddit rate limit exceeded. Narrative will be saved without posting.');
        return null; // Return null to indicate posting failed but continue with saving
      }
      
      // For other errors, still return null to allow saving the narrative
      console.warn('⚠️ Reddit posting failed, but narrative will still be saved locally.');
      return null;
    }
  }

  async generateAndPostNarrative(): Promise<{ success: boolean; narrative?: Narrative; error?: string; mode?: 'full' | 'silent' }> {
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

      // Check bot settings to determine if we should post to Reddit
      const settings = await botSettingsService.getSettings();
      let commentId: string | null = null;
      let mode: 'full' | 'silent' = 'silent';

      if (settings.auto_comment_enabled) {
        // Full automation mode - generate and post
        mode = 'full';
        console.log('🚀 Auto-comment enabled - attempting to post to Reddit...');
        
        try {
          commentId = await this.postNarrativeToReddit(content);
          if (commentId) {
            console.log('✅ Successfully posted to Reddit');
            // Update last comment time in bot settings
            await botSettingsService.updateLastCommentTime();
          } else {
            console.log('⚠️ Reddit posting failed, but continuing with local save');
          }
        } catch (postError) {
          console.warn('⚠️ Reddit posting encountered an error, but continuing with local save:', postError);
        }
      } else {
        // Silent mode - generate only, don't post
        console.log('🔇 Auto-comment disabled - generating narrative in silent mode (no Reddit posting)');
      }

      // Always save to database, regardless of Reddit posting success or mode
      const narrative = await this.saveNarrative(content, incidents.length, commentId || undefined);

      if (mode === 'full') {
        if (commentId) {
          console.log('🎉 Full automation completed: Narrative generated and posted to Reddit successfully');
        } else {
          console.log('🎉 Narrative generated and saved locally (Reddit posting failed due to rate limits or errors)');
        }
      } else {
        console.log('🎉 Silent mode completed: Narrative generated and saved locally (auto-posting disabled)');
      }
      
      return { success: true, narrative, mode };

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