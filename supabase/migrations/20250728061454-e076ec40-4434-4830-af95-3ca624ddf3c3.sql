-- Enable RLS on quantum sync tables
ALTER TABLE quantum_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantum_sync_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quantum_sync_history (global access)
CREATE POLICY "Users can view quantum sync history" 
  ON quantum_sync_history FOR SELECT 
  USING (true);

CREATE POLICY "System can insert quantum sync history" 
  ON quantum_sync_history FOR INSERT 
  WITH CHECK (true);

-- Create RLS policies for quantum_sync_notifications
CREATE POLICY "Users can view their org quantum sync notifications" 
  ON quantum_sync_notifications FOR SELECT 
  USING (org_id = get_user_org_id());

CREATE POLICY "System can insert quantum sync notifications" 
  ON quantum_sync_notifications FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_quantum_customer_id ON contacts(quantum_customer_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_dni_nif ON contacts(org_id, dni_nif);
CREATE INDEX IF NOT EXISTS idx_contacts_org_email ON contacts(org_id, email);
CREATE INDEX IF NOT EXISTS idx_contacts_org_phone ON contacts(org_id, phone);

-- Add quantum_customer_id column to contacts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contacts' AND column_name='quantum_customer_id') THEN
        ALTER TABLE contacts ADD COLUMN quantum_customer_id VARCHAR(255);
    END IF;
END $$;