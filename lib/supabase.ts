import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isDev = process.env.NODE_ENV === 'development';

class MockSupabaseClient {
  from() {
    return this;
  }
  insert() {
    return this;
  }
  update() {
    return this;
  }
  select() {
    return this;
  }
  async single() {
    return {
      data: { id: 'mock-id-' + Math.random().toString(36).substring(2, 9) },
      error: null
    };
  }
  async eq() {
    return {
      data: null,
      error: null
    };
  }
}

export const supabase = isDev
  ? (new MockSupabaseClient() as any)
  : createClient(supabaseUrl, supabaseAnonKey);

