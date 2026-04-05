-- ================================================================
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ================================================================

CREATE TABLE IF NOT EXISTS exam_notifications (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email            text        NOT NULL,
  exam_name        text        NOT NULL,
  last_date        text        NOT NULL DEFAULT 'To be announced',
  last_date_parsed date,                          -- parsed YYYY-MM-DD for date math
  notified_7d      boolean     DEFAULT false,      -- 7-day reminder sent?
  notified_3d      boolean     DEFAULT false,      -- 3-day reminder sent?
  notified_1d      boolean     DEFAULT false,      -- 1-day reminder sent?
  notified_0d      boolean     DEFAULT false,      -- deadline-day reminder sent?
  is_active        boolean     DEFAULT true,       -- false after deadline passes
  created_at       timestamptz DEFAULT now(),

  -- Prevent duplicate subscriptions for same email + exam
  UNIQUE (email, exam_name)
);

-- Index for fast daily cron queries
CREATE INDEX IF NOT EXISTS idx_exam_notif_active_date
  ON exam_notifications (is_active, last_date_parsed);

-- Optional: let anyone insert via the API (service key bypasses this anyway)
ALTER TABLE exam_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access"
  ON exam_notifications
  FOR ALL
  USING (true)
  WITH CHECK (true);
