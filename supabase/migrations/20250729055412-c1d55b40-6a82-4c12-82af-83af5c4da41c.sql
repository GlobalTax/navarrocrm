-- Add quantity and unit_description columns to outgoing_subscriptions table
ALTER TABLE public.outgoing_subscriptions 
ADD COLUMN quantity integer NOT NULL DEFAULT 1,
ADD COLUMN unit_description text DEFAULT 'unidad';

-- Add check constraint to ensure quantity is positive
ALTER TABLE public.outgoing_subscriptions 
ADD CONSTRAINT outgoing_subscriptions_quantity_positive CHECK (quantity > 0);