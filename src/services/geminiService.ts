import { GoogleGenerativeAI } from '@google/generative-ai';
import { BananaIncident } from '../lib/supabase';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ Gemini API key not configured. Narrative generation will be disabled.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('✅ Gemini AI service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
    }
  }

  isConfigured(): boolean {
    return this.genAI !== null && this.model !== null;
  }

  private createPrompt(incidents: BananaIncident[]): string {
    const incidentList = incidents
      .map(incident => `- ${incident.author}: ${incident.action}`)
      .join('\n');

    return `Turn the following list of banana-related Reddit user actions into a silly, absurd, chaotic narrative report. 

Make it fun and entertaining, like a news report from a fictional banana chaos simulator game. Use emojis and keep it under 500 characters. Start with "🍌 **Banana Chaos Report #X**" where X is a random number.

Recent banana incidents:
${incidentList}

Create a short, funny report that summarizes these incidents in an entertaining way. End with "Stay slippery. More chaos soon..." or similar.`;
  }

  async generateNarrative(incidents: BananaIncident[]): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini AI service not configured');
    }

    if (incidents.length === 0) {
      throw new Error('No incidents provided for narrative generation');
    }

    try {
      const prompt = this.createPrompt(incidents);
      console.log('🤖 Generating narrative with Gemini AI...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const narrative = response.text();

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