import { supabase, BananaIncident } from '../lib/supabase';

class GeminiService {
  private supabaseUrl: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!this.supabaseUrl) {
      console.warn('⚠️ Supabase URL not configured. Narrative generation will be disabled.');
    }
  }

  isConfigured(): boolean {
    return !!this.supabaseUrl;
  }

  async generateNarrative(incidents: BananaIncident[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini service not configured');
    }

    if (incidents.length === 0) {
      throw new Error('No incidents provided for narrative generation');
    }

    try {
      console.log('🤖 Generating narrative with Gemini AI via Edge Function...');
      
      // Call the secure Edge Function instead of direct API
      const response = await fetch(`${this.supabaseUrl}/functions/v1/generate-narrative`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ incidents })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate narrative');
      }

      const { narrative } = await response.json();

      if (!narrative || narrative.trim().length === 0) {
        throw new Error('Empty response from Gemini AI');
      }

      console.log('✅ Narrative generated successfully');
      return narrative.trim();
    } catch (error) {
      console.error('❌ Failed to generate narrative with Gemini AI:', error);
      throw new Error('Failed to generate banana chaos narrative');
    }
  }

  // Generate a simple hash for content deduplication
  generateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

export const geminiService = new GeminiService();