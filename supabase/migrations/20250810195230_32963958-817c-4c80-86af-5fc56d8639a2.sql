-- Add auto_renew column to outgoing_subscriptions for paid subscriptions
ALTER TABLE public.outgoing_subscriptions
  ADD COLUMN IF NOT EXISTS auto_renew boolean NOT NULL DEFAULT true;