import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface BananaIncident {
  id: string;
  author: string;
  action: string;
  created_at: string;
  source: string;
  reddit_id?: string;
}

export interface Narrative {
  id: string;
  content: string;
  created_at: string;
  comment_id?: string;
  incident_count: number;
  hash: string;
}

export interface BotSettings {
  id: string;
  auto_comment_enabled: boolean;
  min_interval_minutes: number;
  max_interval_minutes: number;
  last_comment_time: string | null;
  created_at: string;
  updated_at: string;
}