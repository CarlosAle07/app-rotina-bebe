import { supabase } from './supabase';
import type { Database } from './supabase';

type Baby = Database['public']['Tables']['babies']['Row'];
type BabyInsert = Database['public']['Tables']['babies']['Insert'];
type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type Settings = Database['public']['Tables']['settings']['Row'];
type SettingsUpdate = Database['public']['Tables']['settings']['Update'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type UserStats = Database['public']['Tables']['user_stats']['Row'];

// ============================================
// BABIES
// ============================================

export async function getBaby(): Promise<Baby | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('babies')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching baby:', error);
    return null;
  }

  return data;
}

export async function createBaby(baby: Omit<BabyInsert, 'user_id'>): Promise<Baby | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('babies')
    .insert({
      ...baby,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating baby:', error);
    throw error;
  }

  return data;
}

export async function updateBaby(id: string, updates: Partial<BabyInsert>): Promise<Baby | null> {
  const { data, error } = await supabase
    .from('babies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating baby:', error);
    throw error;
  }

  return data;
}

// ============================================
// EVENTS
// ============================================

export async function getEvents(): Promise<Event[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data || [];
}

export async function createEvent(event: Omit<EventInsert, 'user_id'>): Promise<Event | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...event,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  // Atualizar estatísticas do usuário
  await incrementUserStats();

  return data;
}

// ============================================
// SETTINGS
// ============================================

export async function getSettings(): Promise<Settings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }

  return data;
}

export async function updateSettings(updates: SettingsUpdate): Promise<Settings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('settings')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating settings:', error);
    throw error;
  }

  return data;
}

// ============================================
// SUBSCRIPTIONS
// ============================================

export async function getSubscription(): Promise<Subscription | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}

export async function updateSubscription(plan: 'free' | 'monthly' | 'quarterly' | 'annual'): Promise<Subscription | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const expiresAt = plan === 'free' ? null : new Date(
    Date.now() + (
      plan === 'monthly' ? 30 * 24 * 60 * 60 * 1000 :
      plan === 'quarterly' ? 90 * 24 * 60 * 60 * 1000 :
      365 * 24 * 60 * 60 * 1000
    )
  ).toISOString();

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      plan,
      status: 'active',
      expires_at: expiresAt,
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  return data;
}

// ============================================
// USER STATS
// ============================================

export async function getUserStats(): Promise<UserStats | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }

  return data;
}

async function incrementUserStats(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const stats = await getUserStats();
  if (!stats) return;

  const newTotalEvents = stats.total_events + 1;
  const newXp = stats.xp + 10;
  const newLevel = Math.floor(newXp / 100) + 1;

  await supabase
    .from('user_stats')
    .update({
      total_events: newTotalEvents,
      xp: newXp,
      level: newLevel,
    })
    .eq('user_id', user.id);
}

export async function addAchievement(achievementId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const stats = await getUserStats();
  if (!stats) return;

  const achievements = stats.achievements || [];
  if (achievements.includes(achievementId)) return;

  await supabase
    .from('user_stats')
    .update({
      achievements: [...achievements, achievementId],
    })
    .eq('user_id', user.id);
}
