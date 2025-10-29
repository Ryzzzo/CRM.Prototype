/*
  # Add Deals and Files Tables to CRM

  ## 1. New Tables

  ### `deals` Table
  - `id` (uuid, primary key) - Unique identifier for each deal
  - `contact_id` (uuid, foreign key) - References contacts table
  - `name` (text) - Deal name/title
  - `value` (numeric) - Deal value in dollars
  - `stage` (text) - Current stage (Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost)
  - `expected_close_date` (timestamptz) - Expected closing date
  - `probability` (integer) - Win probability percentage (0-100)
  - `description` (text) - Deal description/notes
  - `created_at` (timestamptz) - Deal creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `files` Table
  - `id` (uuid, primary key) - Unique identifier for each file
  - `contact_id` (uuid, foreign key) - References contacts table
  - `filename` (text) - Original filename
  - `file_type` (text) - File extension/MIME type
  - `file_size` (integer) - File size in bytes
  - `category` (text) - File category (Contract, Proposal, Invoice, Document, Image, Other)
  - `storage_path` (text) - Path to file in storage
  - `created_at` (timestamptz) - Upload timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `email_templates` Table
  - `id` (uuid, primary key) - Unique identifier for template
  - `name` (text) - Template name
  - `subject` (text) - Email subject line
  - `body` (text) - Email body content
  - `is_default` (boolean) - Whether it's a default template
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their data
  - Anon access for testing (remove in production)

  ## 3. Indexes
  - Add indexes on foreign keys for performance
  - Add indexes on frequently queried fields
*/

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  name text NOT NULL,
  value numeric DEFAULT 0,
  stage text DEFAULT 'Lead',
  expected_close_date timestamptz,
  probability integer DEFAULT 50,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_type text NOT NULL,
  file_size integer DEFAULT 0,
  category text DEFAULT 'Other',
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_files_contact_id ON files(contact_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deals
CREATE POLICY "Allow all for anon - deals"
  ON deals FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all deals"
  ON deals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete deals"
  ON deals FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for files
CREATE POLICY "Allow all for anon - files"
  ON files FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all files"
  ON files FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update files"
  ON files FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete files"
  ON files FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for email_templates
CREATE POLICY "Allow all for anon - email_templates"
  ON email_templates FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete templates"
  ON email_templates FOR DELETE
  TO authenticated
  USING (true);

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, is_default) VALUES
  ('Introduction', 'Great to connect!', 'Hi {{contact_name}},\n\nIt was wonderful meeting you. I wanted to reach out and introduce myself properly.\n\nLooking forward to our conversation!\n\nBest regards,\n{{your_name}}', true),
  ('Follow-up', 'Following up on our conversation', 'Hi {{contact_name}},\n\nI wanted to follow up on our recent conversation about {{company_name}}.\n\nDo you have time this week for a quick call?\n\nBest regards,\n{{your_name}}', true),
  ('Meeting Request', 'Let''s schedule a meeting', 'Hi {{contact_name}},\n\nI''d love to schedule a meeting to discuss how we can work together.\n\nAre you available next week?\n\nBest regards,\n{{your_name}}', true),
  ('Thank You', 'Thank you!', 'Hi {{contact_name}},\n\nThank you so much for taking the time to meet with me today. I really enjoyed our conversation.\n\nLooking forward to next steps!\n\nBest regards,\n{{your_name}}', true),
  ('Check-in', 'Just checking in', 'Hi {{contact_name}},\n\nI wanted to check in and see how things are going with {{company_name}}.\n\nIs there anything I can help with?\n\nBest regards,\n{{your_name}}', true)
ON CONFLICT DO NOTHING;
