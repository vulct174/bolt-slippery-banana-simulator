/*
  # Add INSERT policy for anonymous users

  1. Security Changes
    - Add policy to allow anonymous users (anon role) to insert banana incidents
    - This enables the Reddit fetching functionality to work with the anonymous key
    - Maintains existing read permissions for public users
    - Keeps service role insert permissions intact

  2. Policy Details
    - Policy name: "Anonymous users can insert incidents"
    - Allows INSERT operations for the 'anon' role
    - Uses 'WITH CHECK (true)' to allow all inserts from anonymous users
*/

CREATE POLICY "Anonymous users can insert incidents"
  ON banana_incidents
  FOR INSERT
  TO anon
  WITH CHECK (true);