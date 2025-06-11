/*
  # Create banana_incidents table

  1. New Tables
    - `banana_incidents`
      - `id` (uuid, primary key)
      - `author` (text, not null)
      - `action` (text, not null)
      - `created_at` (timestamp with timezone, default now())
      - `source` (text, default 'reddit')
      - `reddit_id` (text, unique) - to prevent duplicates

  2. Security
    - Enable RLS on `banana_incidents` table
    - Add policy for public read access (since this is public data)
    - Add policy for service role to insert data

  3. Indexes
    - Index on created_at for efficient sorting
    - Index on reddit_id for duplicate checking
*/

CREATE TABLE IF NOT EXISTS banana_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  source text DEFAULT 'reddit',
  reddit_id text UNIQUE
);

ALTER TABLE banana_incidents ENABLE ROW LEVEL SECURITY;

-- Allow public read access to banana incidents
CREATE POLICY "Anyone can read banana incidents"
  ON banana_incidents
  FOR SELECT
  TO public
  USING (true);

-- Allow service role to insert new incidents
CREATE POLICY "Service role can insert incidents"
  ON banana_incidents
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_banana_incidents_created_at 
  ON banana_incidents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_banana_incidents_reddit_id 
  ON banana_incidents(reddit_id);