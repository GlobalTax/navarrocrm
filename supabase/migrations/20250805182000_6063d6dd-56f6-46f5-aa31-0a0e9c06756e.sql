-- Habilitar RLS y crear políticas de seguridad para las nuevas tablas de empleados

-- 1. Habilitar RLS en todas las nuevas tablas
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autonomous_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para employee_profiles
CREATE POLICY "Users can view employee profiles from their org" 
ON public.employee_profiles 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create employee profiles in their org" 
ON public.employee_profiles 
FOR INSERT 
WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "HR can update employee profiles in their org" 
ON public.employee_profiles 
FOR UPDATE 
USING (
  org_id = get_user_org_id() AND 
  (user_id = auth.uid() OR 
   EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager')))
);

CREATE POLICY "Partners can delete employee profiles in their org" 
ON public.employee_profiles 
FOR DELETE 
USING (
  org_id = get_user_org_id() AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'partner')
);

-- 3. Políticas para employment_contracts
CREATE POLICY "Users can view employment contracts from their org" 
ON public.employment_contracts 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "HR can manage employment contracts in their org" 
ON public.employment_contracts 
FOR ALL 
USING (
  org_id = get_user_org_id() AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager'))
)
WITH CHECK (
  org_id = get_user_org_id() AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager'))
);

-- 4. Políticas para salary_history
CREATE POLICY "Users can view their own salary history" 
ON public.salary_history 
FOR SELECT 
USING (
  org_id = get_user_org_id() AND
  (employee_profile_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid()) OR
   EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager')))
);

CREATE POLICY "HR can manage salary history in their org" 
ON public.salary_history 
FOR ALL 
USING (
  org_id = get_user_org_id() AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager'))
)
WITH CHECK (
  org_id = get_user_org_id() AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager'))
);

-- 5. Políticas para employee_education
CREATE POLICY "Users can view education records from their org" 
ON public.employee_education 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can manage their own education records" 
ON public.employee_education 
FOR ALL 
USING (
  org_id = get_user_org_id() AND
  (employee_profile_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid()) OR
   EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager')))
)
WITH CHECK (
  org_id = get_user_org_id() AND
  (employee_profile_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid()) OR
   EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager')))
);

-- 6. Políticas para autonomous_collaborators
CREATE POLICY "Users can view collaborator info from their org" 
ON public.autonomous_collaborators 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "HR can manage collaborator info in their org" 
ON public.autonomous_collaborators 
FOR ALL 
USING (
  org_id = get_user_org_id() AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager'))
)
WITH CHECK (
  org_id = get_user_org_id() AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager'))
);

-- 7. Políticas para time_attendance
CREATE POLICY "Users can view attendance records from their org" 
ON public.time_attendance 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create their own attendance records" 
ON public.time_attendance 
FOR INSERT 
WITH CHECK (
  org_id = get_user_org_id() AND
  employee_profile_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own attendance records" 
ON public.time_attendance 
FOR UPDATE 
USING (
  org_id = get_user_org_id() AND
  (employee_profile_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid()) OR
   EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager')))
);

CREATE POLICY "HR can delete attendance records in their org" 
ON public.time_attendance 
FOR DELETE 
USING (
  org_id = get_user_org_id() AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager'))
);

-- 8. Políticas para leave_requests
CREATE POLICY "Users can view leave requests from their org" 
ON public.leave_requests 
FOR SELECT 
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create their own leave requests" 
ON public.leave_requests 
FOR INSERT 
WITH CHECK (
  org_id = get_user_org_id() AND
  employee_profile_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid()) AND
  created_by = auth.uid()
);

CREATE POLICY "Users can update their own pending leave requests" 
ON public.leave_requests 
FOR UPDATE 
USING (
  org_id = get_user_org_id() AND
  (employee_profile_id IN (SELECT id FROM public.employee_profiles WHERE user_id = auth.uid()) AND status = 'pending') OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager'))
);

CREATE POLICY "HR can delete leave requests in their org" 
ON public.leave_requests 
FOR DELETE 
USING (
  org_id = get_user_org_id() AND 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('partner', 'area_manager'))
);