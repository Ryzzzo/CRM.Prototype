import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Contact {
  id: string;
  full_name: string;
  company: string;
  email: string;
  phone: string;
  status: 'Lead' | 'Contacted' | 'Proposal' | 'Closed Won' | 'Closed Lost';
  tags: string[];
  notes: string;
  last_contact_date: string;
  created_at: string;
  updated_at: string;
}

export interface ContactActivity {
  id: string;
  contact_id: string;
  activity_type: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  contact_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  contact_id: string;
  content: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}
