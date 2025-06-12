/*
  # Add Bot Settings Table

  1. New Tables
    - `bot_settings`
      - `id` (uuid, primary key)
      - `auto_comment_enabled` (boolean, default true)
      - `min_interval_minutes` (integer, default 8)
      - `max_interval_minutes` (integer, default 15)
      - `last_comment_time` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `bot_settings` table
    - Add policy for service role to manage settings
    - Add policy for anon users to read settings

  3. Initial Data
    - Insert default settings record
*/

CREATE TABLE IF NOT EXISTS bot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_comment_enabled boolean DEFAULT true,
  min_interval_minutes integer DEFAULT 8,
  max_interval_minutes integer DEFAULT 15,
  last_comment_time timestamptz DEFAULT null,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;

-- Service role can manage all settings
CREATE POLICY "Service role can manage bot settings"
  ON bot_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anonymous users can read settings (needed for frontend)
CREATE POLICY "Anyone can read bot settings"
  ON bot_settings
  FOR SELECT
  TO anon
  USING (true);

-- Insert default settings if none exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM bot_settings LIMIT 1) THEN
    INSERT INTO bot_settings (auto_comment_enabled, min_interval_minutes, max_interval_minutes)
    VALUES (true, 8, 15);
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_bot_settings_updated_at ON bot_settings (updated_at DESC);