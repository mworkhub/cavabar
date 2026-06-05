-- ============================================================
-- RLS POLICIES FOR CAVA BAR
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================
-- Legend:
--   anon        = unauthenticated public visitor
--   authenticated = logged-in admin (only admin can sign in)
-- ============================================================


-- ── menu_categories ──────────────────────────────────────────
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read active categories" ON menu_categories;
CREATE POLICY "public can read active categories"
  ON menu_categories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin full access categories" ON menu_categories;
CREATE POLICY "admin full access categories"
  ON menu_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── menu_items ───────────────────────────────────────────────
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read active items" ON menu_items;
CREATE POLICY "public can read active items"
  ON menu_items FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin full access menu_items" ON menu_items;
CREATE POLICY "admin full access menu_items"
  ON menu_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── reviews ──────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read only approved reviews
DROP POLICY IF EXISTS "public can read approved reviews" ON reviews;
CREATE POLICY "public can read approved reviews"
  ON reviews FOR SELECT
  USING (approved = true);

-- Public can submit a review
DROP POLICY IF EXISTS "public can insert review" ON reviews;
CREATE POLICY "public can insert review"
  ON reviews FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin can read, update (approve/reply), delete all
DROP POLICY IF EXISTS "admin full access reviews" ON reviews;
CREATE POLICY "admin full access reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── leads ────────────────────────────────────────────────────
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public can submit a contact form
DROP POLICY IF EXISTS "public can insert lead" ON leads;
CREATE POLICY "public can insert lead"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only admin can read, update, delete
DROP POLICY IF EXISTS "admin full access leads" ON leads;
CREATE POLICY "admin full access leads"
  ON leads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── job_applications ─────────────────────────────────────────
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Public can submit an application
DROP POLICY IF EXISTS "public can insert job application" ON job_applications;
CREATE POLICY "public can insert job application"
  ON job_applications FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only admin can read, update (mark read), delete
DROP POLICY IF EXISTS "admin full access job_applications" ON job_applications;
CREATE POLICY "admin full access job_applications"
  ON job_applications FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── vacancies ────────────────────────────────────────────────
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read active vacancies" ON vacancies;
CREATE POLICY "public can read active vacancies"
  ON vacancies FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin full access vacancies" ON vacancies;
CREATE POLICY "admin full access vacancies"
  ON vacancies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── site_content ─────────────────────────────────────────────
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read site_content" ON site_content;
CREATE POLICY "public can read site_content"
  ON site_content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin can write site_content" ON site_content;
CREATE POLICY "admin can write site_content"
  ON site_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── settings ─────────────────────────────────────────────────
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read settings" ON settings;
CREATE POLICY "public can read settings"
  ON settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admin can update settings" ON settings;
CREATE POLICY "admin can update settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── gallery ──────────────────────────────────────────────────
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read active gallery" ON gallery;
CREATE POLICY "public can read active gallery"
  ON gallery FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin full access gallery" ON gallery;
CREATE POLICY "admin full access gallery"
  ON gallery FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ── Storage: menu-images bucket ──────────────────────────────
-- Run these in Supabase Dashboard → Storage → Policies
-- Or via SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public can view menu images" ON storage.objects;
CREATE POLICY "public can view menu images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "admin can upload menu images" ON storage.objects;
CREATE POLICY "admin can upload menu images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "admin can delete menu images" ON storage.objects;
CREATE POLICY "admin can delete menu images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'menu-images');
