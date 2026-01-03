-- Vehicle Sounds Table
-- Stores associations between vehicles and their engine sound files
CREATE TABLE IF NOT EXISTS vehicle_sounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id VARCHAR(50) NOT NULL, -- AutoConf vehicle ID
  vehicle_name VARCHAR(255) NOT NULL, -- Cached display name
  vehicle_brand VARCHAR(100) NOT NULL, -- Brand name for filtering
  sound_file_url TEXT NOT NULL, -- Path to uploaded audio file
  description TEXT, -- Sound description
  icon VARCHAR(10) DEFAULT '🏎️', -- Emoji icon
  is_electric BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_sounds_vehicle_id ON vehicle_sounds(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_sounds_is_active ON vehicle_sounds(is_active);
CREATE INDEX IF NOT EXISTS idx_vehicle_sounds_display_order ON vehicle_sounds(display_order);

-- Admin Sessions Table
-- Simple token-based authentication for admin panel
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

-- Row Level Security (RLS) Policies
ALTER TABLE vehicle_sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Public read access for active vehicle sounds
CREATE POLICY "Public can read active vehicle sounds"
  ON vehicle_sounds FOR SELECT
  USING (is_active = true);

-- Service role can manage all vehicle sounds
CREATE POLICY "Service role can manage vehicle sounds"
  ON vehicle_sounds FOR ALL
  USING (auth.role() = 'service_role');

-- Service role can manage admin sessions
CREATE POLICY "Service role can manage admin sessions"
  ON admin_sessions FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_vehicle_sounds_updated_at
  BEFORE UPDATE ON vehicle_sounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

