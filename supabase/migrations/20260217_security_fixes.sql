-- =====================================================
-- Security Fixes Migration
-- Date: 2026-02-17
-- Description: Fix RLS policies and security gaps identified in audit
-- =====================================================

-- =====================================================
-- 1. Enable RLS on 6 tables missing it (from 001_initial_schema.sql)
-- =====================================================
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Locations: public read, service_role write
CREATE POLICY "Public can read locations" ON public.locations
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages locations" ON public.locations
  FOR ALL USING (auth.role() = 'service_role');

-- Vehicles: public read (available only), service_role write
CREATE POLICY "Public can read available vehicles" ON public.vehicles
  FOR SELECT TO anon, authenticated USING (status = 'available' OR status = 'highlight');
CREATE POLICY "Service role manages vehicles" ON public.vehicles
  FOR ALL USING (auth.role() = 'service_role');

-- Blog categories: public read, service_role write
CREATE POLICY "Public can read blog categories" ON public.blog_categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages blog categories" ON public.blog_categories
  FOR ALL USING (auth.role() = 'service_role');

-- Blog posts: public read published only, service_role write
CREATE POLICY "Public can read published blog posts" ON public.blog_posts
  FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Service role manages blog posts" ON public.blog_posts
  FOR ALL USING (auth.role() = 'service_role');

-- Contact submissions: no public read, service_role only
CREATE POLICY "Service role manages contact submissions" ON public.contact_submissions
  FOR ALL USING (auth.role() = 'service_role');

-- Webhook events: no public access, service_role only
CREATE POLICY "Service role manages webhook events" ON public.webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 2. Fix overly permissive visitor tracking policies
-- Replace "TO authenticated WITH CHECK (true)" with service_role only
-- (tracking endpoints already use service_role key, so they bypass RLS)
-- =====================================================

-- Drop overly permissive INSERT policies
DROP POLICY IF EXISTS "Service can insert fingerprints" ON public.visitor_fingerprints;
DROP POLICY IF EXISTS "Service can insert sessions" ON public.visitor_sessions;
DROP POLICY IF EXISTS "Service can insert page_views" ON public.visitor_page_views;
DROP POLICY IF EXISTS "Service can insert profiles" ON public.visitor_profiles;
DROP POLICY IF EXISTS "Service can insert identity_events" ON public.identity_events;

-- Drop overly permissive UPDATE policies
DROP POLICY IF EXISTS "Service can update fingerprints" ON public.visitor_fingerprints;
DROP POLICY IF EXISTS "Service can update profiles" ON public.visitor_profiles;

-- Recreate with service_role restriction (note: service_role bypasses RLS,
-- but these policies prevent any authenticated user from writing data)
CREATE POLICY "Only service role can insert fingerprints" ON public.visitor_fingerprints
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Only service role can insert sessions" ON public.visitor_sessions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Only service role can insert page_views" ON public.visitor_page_views
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Only service role can insert profiles" ON public.visitor_profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Only service role can insert identity_events" ON public.identity_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Only service role can update fingerprints" ON public.visitor_fingerprints
  FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Only service role can update profiles" ON public.visitor_profiles
  FOR UPDATE USING (auth.role() = 'service_role');

-- =====================================================
-- 7. Fix storage policies for blog-images bucket
-- Replace open authenticated access with admin-only
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog images" ON storage.objects;

-- Only admins can upload/update/delete blog images
CREATE POLICY "Admins can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update blog images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can delete blog images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- =====================================================
-- 8. Fix page_channel_settings: restrict write to admin only
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can modify page channel settings" ON public.page_channel_settings;

CREATE POLICY "Only admins can modify page channel settings" ON public.page_channel_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- =====================================================
-- 8b. Fix news tables: restrict write to admin/service_role only
-- =====================================================
DROP POLICY IF EXISTS "Service can manage news cycles" ON public.news_cycles;
DROP POLICY IF EXISTS "Service can manage news articles" ON public.news_articles;

CREATE POLICY "Only service role can manage news cycles" ON public.news_cycles
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Only service role can manage news articles" ON public.news_articles
  FOR ALL USING (auth.role() = 'service_role');

-- Revoke ALL from authenticated on news tables (keep SELECT only)
REVOKE INSERT, UPDATE, DELETE ON public.news_cycles FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.news_categories FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.news_sources FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.news_articles FROM authenticated;

