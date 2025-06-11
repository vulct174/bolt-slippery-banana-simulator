/*
  # Create narratives table for AI-generated stories

  1. New Tables
    - `narratives`
      - `id` (uuid, primary key)
      - `content` (text, the generated narrative)
      - `created_at` (timestamp)
      - `comment_id` (text, Reddit comment ID if posted)
      - `incident_count` (integer, number of incidents used)
      - `hash` (text, content hash to prevent duplicates)

  2. Security
    - Enable RLS on `narratives` table
    - Add policies for public read access
    - Add policy for service role to insert narratives

  3. Indexes
    - Index on created_at for chronological ordering
    - Index on hash for duplicate prevention
*/

CREATE TABLE IF NOT EXISTS narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  comment_id text,
  incident_count integer DEFAULT 0,
  hash text UNIQUE
);

ALTER TABLE narratives ENABLE ROW LEVEL SECURITY;

-- Allow public read access to narratives
CREATE POLICY "Anyone can read narratives"
  ON narratives
  FOR SELECT
  TO public
  USING (true);

-- Allow service role to insert narratives
CREATE POLICY "Service role can insert narratives"
  ON narratives
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow anonymous users to insert narratives
CREATE POLICY "Anonymous users can insert narratives"
  ON narratives
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_narratives_created_at 
  ON narratives(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_narratives_hash 
  ON narratives(hash);