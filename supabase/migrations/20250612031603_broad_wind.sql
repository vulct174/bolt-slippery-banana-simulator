/*
  # Create reddit_auth table for OAuth token storage

  1. New Tables
    - `reddit_auth`
      - `id` (uuid, primary key)
      - `username` (text, unique, Reddit username)
      - `access_token` (text, current access token)
      - `refresh_token` (text, refresh token for long-term access)
      - `expires_at` (timestamp, when access token expires)
      - `scope` (text, granted permissions)
      - `created_at` (timestamp, when first authenticated)
      - `updated_at` (timestamp, when last updated)

  2. Security
    - Enable RLS on `reddit_auth` table
    - Add policy for service role access only (sensitive data)
    - No public access to this table

  3. Indexes
    - Index on username for efficient lookups
    - Index on expires_at for token expiry checks
*/

CREATE TABLE IF NOT EXISTS reddit_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz NOT NULL,
  scope text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reddit_auth ENABLE ROW LEVEL SECURITY;

-- Only service role can access this sensitive table
CREATE POLICY "Service role can manage reddit auth"
  ON reddit_auth
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reddit_auth_username 
  ON reddit_auth(username);

CREATE INDEX IF NOT EXISTS idx_reddit_auth_expires_at 
  ON reddit_auth(expires_at);