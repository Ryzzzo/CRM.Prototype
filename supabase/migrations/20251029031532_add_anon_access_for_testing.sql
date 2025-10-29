/*
  # Add anonymous access for testing
  
  1. Changes
    - Add policies to allow anonymous users to read/write contacts, activities, and tasks
    - This enables testing without authentication
  
  2. Security Note
    - This is for development/testing purposes
    - In production, you should require authentication
*/

-- Allow anonymous users to view all contacts
CREATE POLICY "Anonymous users can view contacts"
  ON contacts FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert contacts
CREATE POLICY "Anonymous users can insert contacts"
  ON contacts FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to update contacts
CREATE POLICY "Anonymous users can update contacts"
  ON contacts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to delete contacts
CREATE POLICY "Anonymous users can delete contacts"
  ON contacts FOR DELETE
  TO anon
  USING (true);

-- Allow anonymous users to view activities
CREATE POLICY "Anonymous users can view activities"
  ON contact_activities FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert activities
CREATE POLICY "Anonymous users can insert activities"
  ON contact_activities FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to view tasks
CREATE POLICY "Anonymous users can view tasks"
  ON tasks FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to insert tasks
CREATE POLICY "Anonymous users can insert tasks"
  ON tasks FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to update tasks
CREATE POLICY "Anonymous users can update tasks"
  ON tasks FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to delete tasks
CREATE POLICY "Anonymous users can delete tasks"
  ON tasks FOR DELETE
  TO anon
  USING (true);
