import { supabase } from '../lib/supabase';

export interface BotSettings {
  id: string;
  auto_comment_enabled: boolean;
  min_interval_minutes: number;
  max_interval_minutes: number;
  last_comment_time: string | null;
  created_at: string;
  updated_at: string;
}

class BotSettingsService {
  
  async getSettings(): Promise<BotSettings> {
    try {
      const { data, error } = await supabase
        .from('bot_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Error fetching bot settings:', error);
        // If no settings exist, create default ones
        if (error.code === 'PGRST116') { // No rows returned
          console.log('📝 No bot settings found, creating default settings...');
          return this.createDefaultSettings();
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to get bot settings:', error);
      // Try to create default settings as fallback
      try {
        return await this.createDefaultSettings();
      } catch (createError) {
        console.error('❌ Failed to create default settings:', createError);
        // Return hardcoded defaults as last resort
        return this.getHardcodedDefaults();
      }
    }
  }

  async updateSettings(updates: Partial<Omit<BotSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<BotSettings> {
    try {
      console.log('🔄 Updating bot settings...', updates);
      
      // Validate input
      if (updates.min_interval_minutes && (updates.min_interval_minutes < 1 || updates.min_interval_minutes > 60)) {
        throw new Error('Minimum interval must be between 1 and 60 minutes');
      }
      if (updates.max_interval_minutes && (updates.max_interval_minutes < 1 || updates.max_interval_minutes > 60)) {
        throw new Error('Maximum interval must be between 1 and 60 minutes');
      }
      if (updates.min_interval_minutes && updates.max_interval_minutes && updates.min_interval_minutes > updates.max_interval_minutes) {
        throw new Error('Minimum interval cannot be greater than maximum interval');
      }

      // Get current settings first
      const currentSettings = await this.getSettings();
      
      const { data, error } = await supabase
        .from('bot_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSettings.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating bot settings:', error);
        throw new Error(`Failed to update bot settings: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from update operation');
      }

      console.log('✅ Bot settings updated successfully');
      return data;
    } catch (error) {
      console.error('❌ Failed to update bot settings:', error);
      throw error;
    }
  }

  async updateLastCommentTime(): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      
      const { error } = await supabase
        .from('bot_settings')
        .update({
          last_comment_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSettings.id);

      if (error) {
        console.error('❌ Error updating last comment time:', error);
        throw error;
      }

      console.log('✅ Last comment time updated');
    } catch (error) {
      console.error('❌ Failed to update last comment time:', error);
      // Don't throw here as this is not critical
    }
  }

  private async createDefaultSettings(): Promise<BotSettings> {
    try {
      console.log('📝 Creating default bot settings...');
      
      const { data, error } = await supabase
        .from('bot_settings')
        .insert({
          auto_comment_enabled: true,
          min_interval_minutes: 8,
          max_interval_minutes: 15
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating default settings:', error);
        throw error;
      }

      console.log('✅ Default bot settings created');
      return data;
    } catch (error) {
      console.error('❌ Failed to create default settings:', error);
      throw error;
    }
  }

  private getHardcodedDefaults(): BotSettings {
    return {
      id: 'default',
      auto_comment_enabled: true,
      min_interval_minutes: 8,
      max_interval_minutes: 15,
      last_comment_time: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Calculate next comment time based on randomized interval
  calculateNextCommentTime(lastCommentTime: string | null, minMinutes: number, maxMinutes: number): Date {
    const now = new Date();
    const lastTime = lastCommentTime ? new Date(lastCommentTime) : now;
    
    // Generate random interval between min and max
    const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
    
    // Add random interval to last comment time
    const nextTime = new Date(lastTime.getTime() + (randomMinutes * 60 * 1000));
    
    // Ensure next time is at least now + min interval
    const minNextTime = new Date(now.getTime() + (minMinutes * 60 * 1000));
    
    return nextTime > minNextTime ? nextTime : minNextTime;
  }

  // Check if it's time to post a comment
  async shouldPostComment(): Promise<{ shouldPost: boolean; nextCommentTime?: Date; timeRemaining?: number }> {
    try {
      const settings = await this.getSettings();
      
      if (!settings.auto_comment_enabled) {
        return { shouldPost: false };
      }

      const now = new Date();
      const nextCommentTime = this.calculateNextCommentTime(
        settings.last_comment_time,
        settings.min_interval_minutes,
        settings.max_interval_minutes
      );

      const shouldPost = now >= nextCommentTime;
      const timeRemaining = shouldPost ? 0 : nextCommentTime.getTime() - now.getTime();

      return {
        shouldPost,
        nextCommentTime,
        timeRemaining
      };
    } catch (error) {
      console.error('❌ Error checking if should post comment:', error);
      return { shouldPost: false };
    }
  }
}

export const botSettingsService = new BotSettingsService();