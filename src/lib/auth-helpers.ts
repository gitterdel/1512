import { supabase } from './supabase';
import { DatabaseLogger } from './database-logger';
import { User } from '../types';

export async function validateSession(): Promise<User | null> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    if (!session) return null;

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      if (!userError.message.includes('no rows')) {
        throw userError;
      }
      return null;
    }

    if (!userData) return null;

    // Map database user to User type
    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      status: userData.status,
      verified: userData.verified,
      createdAt: new Date(userData.created_at),
      lastLogin: new Date(userData.last_login),
      avatar: userData.avatar_url,
      phone: userData.phone,
      location: userData.location,
      dateOfBirth: userData.date_of_birth ? new Date(userData.date_of_birth) : undefined,
      bio: userData.bio,
      verifiedAt: userData.verified_at ? new Date(userData.verified_at) : undefined,
      tenantInfo: userData.tenant_info
    };

    return user;
  } catch (error) {
    DatabaseLogger.logError('Session Validation', error);
    return null;
  }
}

export async function refreshSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    return !error && !!session;
  } catch (error) {
    DatabaseLogger.logError('Session Refresh', error);
    return false;
  }
}