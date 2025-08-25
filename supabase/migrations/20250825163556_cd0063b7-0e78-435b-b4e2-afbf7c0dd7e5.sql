-- Document why remaining SECURITY DEFINER functions are necessary

-- Core security functions that MUST keep SECURITY DEFINER
COMMENT ON FUNCTION public.get_current_user_org_id() IS 'SECURITY DEFINER required: bypasses RLS to get current user org_id';
COMMENT ON FUNCTION public.handle_invitation_acceptance() IS 'SECURITY DEFINER required: trigger function needs elevated privileges to create users';
COMMENT ON FUNCTION public.validate_role_change() IS 'SECURITY DEFINER required: trigger function needs elevated privileges to validate role changes';
COMMENT ON FUNCTION public.log_role_change() IS 'SECURITY DEFINER required: trigger function needs elevated privileges for audit logging';
COMMENT ON FUNCTION public.enhanced_log_role_change() IS 'SECURITY DEFINER required: trigger function needs elevated privileges for audit logging';

-- Token generation functions (security-sensitive)
COMMENT ON FUNCTION public.generate_invitation_token() IS 'SECURITY DEFINER required: generates secure tokens for invitations';
COMMENT ON FUNCTION public.generate_onboarding_token() IS 'SECURITY DEFINER required: generates secure tokens for onboarding';
COMMENT ON FUNCTION public.generate_signature_token() IS 'SECURITY DEFINER required: generates secure tokens for signatures';
COMMENT ON FUNCTION public.generate_job_offer_token() IS 'SECURITY DEFINER required: generates secure tokens for job offers';

-- System maintenance functions
COMMENT ON FUNCTION public.cleanup_expired_invitations() IS 'SECURITY DEFINER required: system function needs elevated privileges for cleanup';
COMMENT ON FUNCTION public.cleanup_expired_onboarding() IS 'SECURITY DEFINER required: system function needs elevated privileges for cleanup';
COMMENT ON FUNCTION public.cleanup_expired_tokens() IS 'SECURITY DEFINER required: system function needs elevated privileges for cleanup';

-- Audit and logging functions
COMMENT ON FUNCTION public.log_proposal_changes() IS 'SECURITY DEFINER required: trigger function needs elevated privileges for audit logging';
COMMENT ON FUNCTION public.log_deed_status_history() IS 'SECURITY DEFINER required: trigger function needs elevated privileges for audit logging';
COMMENT ON FUNCTION public.log_sensitive_data_access() IS 'SECURITY DEFINER required: trigger function needs elevated privileges for security logging';

-- System setup and status functions
COMMENT ON FUNCTION public.is_system_setup() IS 'SECURITY DEFINER required: system function needs to check setup status without user context';
COMMENT ON FUNCTION public.get_setup_status() IS 'SECURITY DEFINER required: system function needs to check setup status without user context';

-- Auto-creation trigger functions
COMMENT ON FUNCTION public.auto_create_employee_onboarding() IS 'SECURITY DEFINER required: trigger function needs elevated privileges to create records';
COMMENT ON FUNCTION public.auto_create_recurring_fee() IS 'SECURITY DEFINER required: trigger function needs elevated privileges to create records';

-- Number generation functions (need to ensure uniqueness across org)
COMMENT ON FUNCTION public.generate_employee_number(uuid) IS 'SECURITY DEFINER required: needs elevated privileges to ensure unique numbering';
COMMENT ON FUNCTION public.generate_matter_number(uuid) IS 'SECURITY DEFINER required: needs elevated privileges to ensure unique numbering';
COMMENT ON FUNCTION public.generate_proposal_number(uuid) IS 'SECURITY DEFINER required: needs elevated privileges to ensure unique numbering';

-- External integration functions
COMMENT ON FUNCTION public.sincronizar_cuentas_quantum() IS 'SECURITY DEFINER required: external integration needs elevated privileges for data sync';
COMMENT ON FUNCTION public.process_scheduled_reports() IS 'SECURITY DEFINER required: system function needs elevated privileges for scheduled operations';