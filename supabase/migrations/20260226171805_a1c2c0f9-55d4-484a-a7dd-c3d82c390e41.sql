
-- Grant permissions on the new table for authenticated users
GRANT SELECT, INSERT, UPDATE ON public.contact_classification_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.contact_classification_reviews TO anon;
