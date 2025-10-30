/*
  # Add Dummy Contacts, Tasks, and Activities for Testing

  ## 1. Purpose
  Populate the CRM database with 15-20 realistic dummy contacts across various stages
  to demonstrate the full functionality of the dashboard and contact management features.

  ## 2. Contacts Added
  - 18 contacts with diverse names, companies, and contact information
  - Distributed across all stages: Lead, Contacted, Proposal, Closed Won, Closed Lost
  - Various industries and company sizes

  ## 3. Related Data
  - Tasks assigned to multiple contacts with different priorities and due dates
  - Contact activities for engagement tracking
  - Notes for several contacts

  ## 4. Important Notes
  - All email addresses use example.com domain (safe for testing)
  - Phone numbers use (555) prefix (safe for testing)
  - Data is diverse enough to test filtering, sorting, and analytics
*/

-- Insert 18 dummy contacts with various stages
INSERT INTO contacts (full_name, email, phone, company, status, notes, last_contact_date) VALUES
  ('Sarah Mitchell', 'sarah.mitchell@example.com', '+1 (555) 234-5678', 'TechStart Inc', 'Lead', 'Interested in enterprise plan', NOW() - INTERVAL '2 days'),
  ('James Rodriguez', 'james.r@example.com', '+1 (555) 345-6789', 'CloudVentures LLC', 'Contacted', 'Scheduled demo for next week', NOW() - INTERVAL '1 day'),
  ('Emily Chen', 'emily.chen@example.com', '+1 (555) 456-7890', 'DataFlow Solutions', 'Proposal', 'Sent proposal on Dec 1st, awaiting response', NOW() - INTERVAL '3 days'),
  ('Michael Thompson', 'mthompson@example.com', '+1 (555) 567-8901', 'InnovateCorp', 'Closed Won', 'Signed 12-month contract for premium tier', NOW() - INTERVAL '5 days'),
  ('Jessica Wang', 'jwang@example.com', '+1 (555) 678-9012', 'Digital Dynamics', 'Lead', 'Downloaded whitepaper, needs follow-up', NOW() - INTERVAL '1 day'),
  ('David Kim', 'david.kim@example.com', '+1 (555) 789-0123', 'NextGen Analytics', 'Contacted', 'Interested in API integrations', NOW() - INTERVAL '4 days'),
  ('Amanda Foster', 'afoster@example.com', '+1 (555) 890-1234', 'BrightFuture Consulting', 'Proposal', 'Reviewing pricing options', NOW() - INTERVAL '2 days'),
  ('Robert Chen', 'robert.c@example.com', '+1 (555) 901-2345', 'Summit Technologies', 'Closed Won', 'Successfully onboarded last month', NOW() - INTERVAL '30 days'),
  ('Laura Martinez', 'laura.m@example.com', '+1 (555) 012-3456', 'GlobalTech Partners', 'Lead', 'Attended webinar, expressed interest', NOW()),
  ('Christopher Lee', 'clee@example.com', '+1 (555) 123-4567', 'Quantum Systems', 'Contacted', 'Completed initial discovery call', NOW() - INTERVAL '6 days'),
  ('Nicole Anderson', 'nicole.a@example.com', '+1 (555) 234-5679', 'Velocity Solutions', 'Proposal', 'Negotiating contract terms', NOW() - INTERVAL '1 day'),
  ('Brandon Taylor', 'btaylor@example.com', '+1 (555) 345-6780', 'Apex Industries', 'Closed Lost', 'Chose competitor due to pricing', NOW() - INTERVAL '15 days'),
  ('Sophia Patel', 'sophia.p@example.com', '+1 (555) 456-7891', 'FusionWorks', 'Lead', 'Warm lead from referral', NOW() - INTERVAL '3 days'),
  ('Andrew Wilson', 'awilson@example.com', '+1 (555) 567-8902', 'Pioneer Enterprises', 'Contacted', 'Interested in team plan', NOW() - INTERVAL '2 days'),
  ('Rachel Green', 'rgreen@example.com', '+1 (555) 678-9013', 'Horizon Group', 'Proposal', 'Custom solution being prepared', NOW() - INTERVAL '5 days'),
  ('Daniel Brown', 'dbrown@example.com', '+1 (555) 789-0124', 'Catalyst Networks', 'Closed Won', 'Upgraded from starter to business plan', NOW() - INTERVAL '20 days'),
  ('Olivia Davis', 'olivia.d@example.com', '+1 (555) 890-1235', 'Synergy Labs', 'Lead', 'Requested product demo', NOW() - INTERVAL '1 day'),
  ('Matthew Garcia', 'mgarcia@example.com', '+1 (555) 901-2346', 'Evolution Tech', 'Closed Lost', 'Not ready to purchase at this time', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Insert tasks for various contacts
DO $$
DECLARE
  contact_sarah UUID;
  contact_james UUID;
  contact_emily UUID;
  contact_jessica UUID;
  contact_david UUID;
  contact_amanda UUID;
  contact_laura UUID;
  contact_chris UUID;
  contact_nicole UUID;
  contact_sophia UUID;
  contact_andrew UUID;
  contact_rachel UUID;
  contact_olivia UUID;
BEGIN
  -- Get contact IDs
  SELECT id INTO contact_sarah FROM contacts WHERE email = 'sarah.mitchell@example.com';
  SELECT id INTO contact_james FROM contacts WHERE email = 'james.r@example.com';
  SELECT id INTO contact_emily FROM contacts WHERE email = 'emily.chen@example.com';
  SELECT id INTO contact_jessica FROM contacts WHERE email = 'jwang@example.com';
  SELECT id INTO contact_david FROM contacts WHERE email = 'david.kim@example.com';
  SELECT id INTO contact_amanda FROM contacts WHERE email = 'afoster@example.com';
  SELECT id INTO contact_laura FROM contacts WHERE email = 'laura.m@example.com';
  SELECT id INTO contact_chris FROM contacts WHERE email = 'clee@example.com';
  SELECT id INTO contact_nicole FROM contacts WHERE email = 'nicole.a@example.com';
  SELECT id INTO contact_sophia FROM contacts WHERE email = 'sophia.p@example.com';
  SELECT id INTO contact_andrew FROM contacts WHERE email = 'awilson@example.com';
  SELECT id INTO contact_rachel FROM contacts WHERE email = 'rgreen@example.com';
  SELECT id INTO contact_olivia FROM contacts WHERE email = 'olivia.d@example.com';

  -- Insert tasks
  IF contact_sarah IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_sarah, 'Follow up on whitepaper download', 'Call to discuss enterprise features', NOW() + INTERVAL '2 days', 'high', false);
  END IF;

  IF contact_james IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_james, 'Prepare demo environment', 'Set up demo account with sample data', NOW() + INTERVAL '5 days', 'high', false),
      (contact_james, 'Send calendar invite for demo', 'Schedule 1-hour product demo', NOW() + INTERVAL '3 days', 'medium', false);
  END IF;

  IF contact_emily IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_emily, 'Follow up on proposal', 'Check if they have any questions', NOW() + INTERVAL '1 day', 'high', false);
  END IF;

  IF contact_jessica IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_jessica, 'Schedule discovery call', 'Understand their pain points and needs', NOW() + INTERVAL '4 days', 'medium', false);
  END IF;

  IF contact_david IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_david, 'Send API documentation', 'Share technical integration guides', NOW() + INTERVAL '2 days', 'medium', false);
  END IF;

  IF contact_amanda IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_amanda, 'Prepare custom pricing', 'Create tailored package for their needs', NOW() + INTERVAL '3 days', 'high', false);
  END IF;

  IF contact_laura IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_laura, 'Send welcome email', 'Thank them for attending webinar', NOW() + INTERVAL '1 day', 'low', false);
  END IF;

  IF contact_chris IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_chris, 'Send proposal', 'Based on discovery call findings', NOW() + INTERVAL '6 days', 'high', false);
  END IF;

  IF contact_nicole IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_nicole, 'Review contract terms', 'Address their legal questions', NOW() + INTERVAL '2 days', 'high', false);
  END IF;

  IF contact_sophia IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_sophia, 'Thank referral source', 'Send thank you note to referrer', NOW() + INTERVAL '1 day', 'low', false);
  END IF;

  IF contact_andrew IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_andrew, 'Send team plan details', 'Share pricing and features for teams', NOW() + INTERVAL '3 days', 'medium', false);
  END IF;

  IF contact_rachel IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_rachel, 'Finalize custom solution', 'Get engineering approval on specs', NOW() + INTERVAL '5 days', 'high', false);
  END IF;

  IF contact_olivia IS NOT NULL THEN
    INSERT INTO tasks (contact_id, title, description, due_date, priority, completed) VALUES
      (contact_olivia, 'Schedule product demo', 'Coordinate time for live demo', NOW() + INTERVAL '4 days', 'high', false);
  END IF;
END $$;

-- Insert contact activities
DO $$
DECLARE
  contact_sarah UUID;
  contact_james UUID;
  contact_emily UUID;
  contact_michael UUID;
  contact_jessica UUID;
  contact_laura UUID;
  contact_olivia UUID;
BEGIN
  SELECT id INTO contact_sarah FROM contacts WHERE email = 'sarah.mitchell@example.com';
  SELECT id INTO contact_james FROM contacts WHERE email = 'james.r@example.com';
  SELECT id INTO contact_emily FROM contacts WHERE email = 'emily.chen@example.com';
  SELECT id INTO contact_michael FROM contacts WHERE email = 'mthompson@example.com';
  SELECT id INTO contact_jessica FROM contacts WHERE email = 'jwang@example.com';
  SELECT id INTO contact_laura FROM contacts WHERE email = 'laura.m@example.com';
  SELECT id INTO contact_olivia FROM contacts WHERE email = 'olivia.d@example.com';

  IF contact_sarah IS NOT NULL THEN
    INSERT INTO contact_activities (contact_id, activity_type, content, created_at) VALUES
      (contact_sarah, 'note', 'Downloaded enterprise whitepaper', NOW() - INTERVAL '2 days');
  END IF;

  IF contact_james IS NOT NULL THEN
    INSERT INTO contact_activities (contact_id, activity_type, content, created_at) VALUES
      (contact_james, 'call', 'Initial outreach call - very interested', NOW() - INTERVAL '1 day'),
      (contact_james, 'email', 'Sent demo scheduling options', NOW() - INTERVAL '12 hours');
  END IF;

  IF contact_emily IS NOT NULL THEN
    INSERT INTO contact_activities (contact_id, activity_type, content, created_at) VALUES
      (contact_emily, 'email', 'Proposal sent with custom pricing', NOW() - INTERVAL '3 days'),
      (contact_emily, 'note', 'They need approval from CFO', NOW() - INTERVAL '2 days');
  END IF;

  IF contact_michael IS NOT NULL THEN
    INSERT INTO contact_activities (contact_id, activity_type, content, created_at) VALUES
      (contact_michael, 'status_change', 'Contract signed - Closed Won', NOW() - INTERVAL '5 days'),
      (contact_michael, 'note', 'Very happy with onboarding process', NOW() - INTERVAL '4 days');
  END IF;

  IF contact_jessica IS NOT NULL THEN
    INSERT INTO contact_activities (contact_id, activity_type, content, created_at) VALUES
      (contact_jessica, 'note', 'Downloaded whitepaper on automation', NOW() - INTERVAL '1 day');
  END IF;

  IF contact_laura IS NOT NULL THEN
    INSERT INTO contact_activities (contact_id, activity_type, content, created_at) VALUES
      (contact_laura, 'note', 'Attended "Scaling Your Business" webinar', NOW() - INTERVAL '3 hours');
  END IF;

  IF contact_olivia IS NOT NULL THEN
    INSERT INTO contact_activities (contact_id, activity_type, content, created_at) VALUES
      (contact_olivia, 'email', 'Inquiry about product demo', NOW() - INTERVAL '1 day');
  END IF;
END $$;
