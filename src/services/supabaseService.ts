import { supabase, BananaIncident } from '../lib/supabase';

export const saveIncidentsToSupabase = async (incidents: BananaIncident[]): Promise<number> => {
  if (incidents.length === 0) return 0;

  try {
    // Use upsert to handle duplicates based on reddit_id
    const { data, error } = await supabase
      .from('banana_incidents')
      .upsert(
        incidents.map(incident => ({
          author: incident.author,
          action: incident.action,
          created_at: incident.created_at,
          source: incident.source,
          reddit_id: incident.reddit_id
        })),
        { 
          onConflict: 'reddit_id',
          ignoreDuplicates: true 
        }
      )
      .select();

    if (error) {
      console.error('❌ Error saving incidents to Supabase:', error);
      throw error;
    }

    const newIncidentsCount = data?.length || 0;
    console.log(`💾 Saved ${newIncidentsCount} new banana incidents to Supabase`);
    return newIncidentsCount;
  } catch (error) {
    console.error('❌ Failed to save incidents to Supabase:', error);
    throw error;
  }
};

export const fetchIncidentsFromSupabase = async (page: number = 1, limit: number = 20): Promise<{
  incidents: BananaIncident[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}> => {
  try {
    // Get total count
    const { count, error: countError } = await supabase
      .from('banana_incidents')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting incident count:', countError);
      throw countError;
    }

    // Get paginated data
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error } = await supabase
      .from('banana_incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .range(start, end);

    if (error) {
      console.error('❌ Error fetching incidents from Supabase:', error);
      throw error;
    }

    const total = count || 0;
    const hasMore = start + limit < total;

    return {
      incidents: data || [],
      page,
      limit,
      total,
      hasMore
    };
  } catch (error) {
    console.error('❌ Failed to fetch incidents from Supabase:', error);
    throw error;
  }
};