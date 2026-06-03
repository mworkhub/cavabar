-- Add moderation column — new reviews hidden until manually approved
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false;

-- Replace public SELECT policy: show only approved reviews
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public"
  ON reviews FOR SELECT
  USING (approved = true);
