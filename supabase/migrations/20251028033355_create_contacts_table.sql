/*
  # Create CRM Contacts Table

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key) - Unique identifier for each contact
      - `full_name` (text) - Contact's full name
      - `company` (text) - Company name
      - `email` (text) - Email address
      - `phone` (text) - Phone number
      - `status` (text) - Current status (Lead, Contacted, Proposal, Closed Won, Closed Lost)
      - `tags` (text[]) - Array of tags for categorization
      - `notes` (text) - General notes about the contact
      - `last_contact_date` (timestamptz) - Date of last contact
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `contact_activities`
      - `id` (uuid, primary key) - Unique identifier for each activity
      - `contact_id` (uuid, foreign key) - References contacts table
      - `activity_type` (text) - Type of activity (note, status_change, email, call)
      - `content` (text) - Activity content/description
      - `created_at` (timestamptz) - Activity timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their contacts
    - Contacts are accessible to all authenticated users (team-wide CRM)

  3. Indexes
    - Add index on contact_id for activities table
    - Add index on status for filtering
    - Add index on email for searching
*/

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  status text DEFAULT 'Lead',
  tags text[] DEFAULT '{}',
  notes text DEFAULT '',
  last_contact_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact activities table
CREATE TABLE IF NOT EXISTS contact_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON contact_activities(contact_id);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts table
CREATE POLICY "Authenticated users can view all contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for contact_activities table
CREATE POLICY "Authenticated users can view all activities"
  ON contact_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activities"
  ON contact_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update activities"
  ON contact_activities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete activities"
  ON contact_activities FOR DELETE
  TO authenticated
  USING (true);