CREATE TABLE IF NOT EXISTS analytics_cache (
  id TEXT PRIMARY KEY DEFAULT 'ga4_dashboard_data',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  quota_exceeded BOOLEAN DEFAULT FALSE
);

-- Insert seed row
INSERT INTO analytics_cache (id, data, updated_at, quota_exceeded)
VALUES (
  'ga4_dashboard_data', 
  '{"activeUsers": 0, "screenPageViews": 0, "sessions": 0, "bounceRate": 0}', 
  NOW(), 
  FALSE
)
ON CONFLICT (id) DO NOTHING;
