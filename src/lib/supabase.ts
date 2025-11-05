import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
}

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

export interface Deal {
  id: string;
  contact_id: string;
  name: string;
  value: number;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  expected_close_date: string;
  probability: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  contact_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  category: 'Contract' | 'Proposal' | 'Invoice' | 'Document' | 'Image' | 'Other';
  storage_path: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
