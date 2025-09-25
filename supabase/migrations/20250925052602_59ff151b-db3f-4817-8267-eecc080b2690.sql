-- Agregar política RLS para permitir eliminar invitaciones
CREATE POLICY "Users can delete invitations from their org" 
ON public.user_invitations 
FOR DELETE 
USING (org_id = get_user_org_id());