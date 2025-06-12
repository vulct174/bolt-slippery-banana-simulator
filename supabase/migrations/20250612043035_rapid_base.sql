/*
  # Fix bot settings permissions

  1. Security Updates
    - Add proper RLS policies for bot_settings table
    - Allow anonymous users to update settings (needed for admin panel)
    - Ensure service role has full access

  2. Data Integrity
    - Add validation constraints
    - Ensure default record exists
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Service role can manage bot settings" ON bot_settings;
DROP POLICY IF EXISTS "Anyone can read bot settings" ON bot_settings;

-- Create comprehensive policies
CREATE POLICY "Service role can manage bot settings"
  ON bot_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read bot settings"
  ON bot_settings
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to update settings (needed for admin panel)
CREATE POLICY "Anonymous users can update bot settings"
  ON bot_settings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to insert settings if none exist
CREATE POLICY "Anonymous users can insert bot settings"
  ON bot_settings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add constraints for data validation
DO $$
BEGIN
  -- Add check constraints if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'bot_settings_min_interval_check'
  ) THEN
    ALTER TABLE bot_settings ADD CONSTRAINT bot_settings_min_interval_check 
    CHECK (min_interval_minutes >= 1 AND min_interval_minutes <= 60);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'bot_settings_max_interval_check'
  ) THEN
    ALTER TABLE bot_settings ADD CONSTRAINT bot_settings_max_interval_check 
    CHECK (max_interval_minutes >= 1 AND max_interval_minutes <= 60);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'bot_settings_interval_order_check'
  ) THEN
    ALTER TABLE bot_settings ADD CONSTRAINT bot_settings_interval_order_check 
    CHECK (min_interval_minutes <= max_interval_minutes);
  END IF;
END $$;

-- Ensure default settings exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM bot_settings LIMIT 1) THEN
    INSERT INTO bot_settings (auto_comment_enabled, min_interval_minutes, max_interval_minutes)
    VALUES (true, 8, 15);
  END IF;
END $$;