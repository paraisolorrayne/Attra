-- Migration: Vehicle Sounds Table and Storage Setup
-- This migration creates the vehicle_sounds table and sets up storage policies

-- Create vehicle_sounds table
CREATE TABLE IF NOT EXISTS vehicle_sounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id VARCHAR(50) NOT NULL,
  vehicle_name VARCHAR(255) NOT NULL,
  vehicle_brand VARCHAR(100) NOT NULL,
  vehicle_slug VARCHAR(255) DEFAULT '',
  sound_file_url TEXT NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '🏎️',
  is_electric BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on vehicle_id to prevent duplicate sounds per vehicle
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_sounds_vehicle_id 
ON vehicle_sounds(vehicle_id);

-- Create index for active sounds ordered by display_order
CREATE INDEX IF NOT EXISTS idx_vehicle_sounds_active 
ON vehicle_sounds(is_active, display_order);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_vehicle_sounds_updated_at ON vehicle_sounds;
CREATE TRIGGER update_vehicle_sounds_updated_at
  BEFORE UPDATE ON vehicle_sounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE vehicle_sounds ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active sounds
CREATE POLICY "Allow public read access to active sounds"
ON vehicle_sounds
FOR SELECT
USING (is_active = true);

-- Policy: Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access"
ON vehicle_sounds
FOR ALL
USING (auth.role() = 'service_role');

-- Create storage bucket for audio files (run this in SQL Editor)
-- Note: Storage bucket creation must be done via Dashboard or API
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('audio-files', 'audio-files', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio-files bucket
-- These need to be created after the bucket exists

-- Policy: Allow public read access to audio files
-- CREATE POLICY "Allow public read access to audio files"
-- ON storage.objects
-- FOR SELECT
-- USING (bucket_id = 'audio-files');

-- Policy: Allow service role to upload/delete audio files
-- CREATE POLICY "Allow service role to manage audio files"
-- ON storage.objects
-- FOR ALL
-- USING (bucket_id = 'audio-files' AND auth.role() = 'service_role');

