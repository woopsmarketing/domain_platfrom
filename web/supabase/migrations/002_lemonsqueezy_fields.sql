ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS lemon_subscription_id text,
  ADD COLUMN IF NOT EXISTS lemon_customer_id text,
  ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS cancel_at timestamp with time zone;
