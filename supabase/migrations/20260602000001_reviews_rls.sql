-- Enable Row Level Security on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anonymous visitors) can read reviews
CREATE POLICY "reviews_select_public"
  ON reviews FOR SELECT
  USING (true);

-- Anyone can submit a review (no auth required)
CREATE POLICY "reviews_insert_public"
  ON reviews FOR INSERT
  WITH CHECK (true);
