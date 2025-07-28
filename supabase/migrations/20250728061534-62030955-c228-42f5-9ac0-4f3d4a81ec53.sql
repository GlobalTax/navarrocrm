-- Create indexes for better performance (only if not exists)
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