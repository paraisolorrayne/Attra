-- Admin Users Authentication Schema
-- Supabase-based authentication for admin panel with role-based access control

-- Create role enum type
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('admin', 'gerente');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Admin users table (links to Supabase Auth users)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role admin_role NOT NULL DEFAULT 'gerente',
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated at trigger
CREATE TRIGGER trigger_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Create helper function FIRST to avoid infinite recursion in policies
-- This function uses SECURITY DEFINER to bypass RLS when checking admin status
CREATE OR REPLACE FUNCTION check_is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Direct table access bypasses RLS due to SECURITY DEFINER
  SELECT role::TEXT INTO user_role FROM admin_users WHERE id = user_id AND is_active = true;
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for admin_users table
-- Users can read their own record (simple, no recursion)
CREATE POLICY "Users can read own admin profile" ON admin_users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all admin users (uses SECURITY DEFINER function to avoid recursion)
CREATE POLICY "Admins can read all admin users" ON admin_users
  FOR SELECT USING (check_is_admin(auth.uid()));

-- Only admins can insert new admin users
CREATE POLICY "Only admins can create admin users" ON admin_users
  FOR INSERT WITH CHECK (check_is_admin(auth.uid()));

-- Only admins can update admin users (except own last_login)
CREATE POLICY "Only admins can update admin users" ON admin_users
  FOR UPDATE USING (
    -- Allow users to update their own record
    (auth.uid() = id) OR
    -- Allow admins to update any user
    check_is_admin(auth.uid())
  );

-- Service role has full access (for server-side operations)
CREATE POLICY "Service role full access on admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = user_id AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has admin panel access
CREATE OR REPLACE FUNCTION has_admin_access(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_admin_role(user_id UUID)
RETURNS admin_role AS $$
DECLARE
  user_role admin_role;
BEGIN
  SELECT role INTO user_role FROM admin_users 
  WHERE id = user_id AND is_active = true;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_admin_last_login(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE admin_users 
  SET last_login_at = NOW() 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE admin_users IS 'Admin panel users with role-based access control';
COMMENT ON COLUMN admin_users.role IS 'admin = full access, gerente = engine-sounds only';
COMMENT ON COLUMN admin_users.is_active IS 'Inactive users cannot log in';

