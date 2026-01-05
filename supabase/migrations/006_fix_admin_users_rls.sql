-- Fix infinite recursion in admin_users RLS policies
-- This migration drops the problematic policies and recreates them using SECURITY DEFINER functions

-- First, create the helper function if it doesn't exist
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

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own admin profile" ON admin_users;
DROP POLICY IF EXISTS "Admins can read all admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can create admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Service role full access on admin_users" ON admin_users;

-- Recreate policies without infinite recursion

-- Users can read their own record (simple, no recursion)
CREATE POLICY "Users can read own admin profile" ON admin_users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all admin users (uses SECURITY DEFINER function to avoid recursion)
CREATE POLICY "Admins can read all admin users" ON admin_users
  FOR SELECT USING (check_is_admin(auth.uid()));

-- Only admins can insert new admin users
CREATE POLICY "Only admins can create admin users" ON admin_users
  FOR INSERT WITH CHECK (check_is_admin(auth.uid()));

-- Only admins can update admin users (except own record)
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

