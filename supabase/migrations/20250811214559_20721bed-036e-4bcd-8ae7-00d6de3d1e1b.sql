-- 1) Actualizar validaciones de transición de estado en deeds
CREATE OR REPLACE FUNCTION public.validate_deed_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
  old_status text := old.status;
  new_status text := new.status;
  is_new_status boolean := new_status in (
    'NOTARIO_FIRMADA','IMPUESTOS_PENDIENTES','IMPUESTOS_ACREDITADOS','EN_REGISTRO',
    'EN_CALIFICACION','DEFECTOS','SUBSANACION','INSCRITA','BORME_PUBLICADO','CIERRE_EXPEDIENTE'
  );
  allowed boolean := true;
  t_itp_procede boolean;
  t_itp_pdf text;
  t_iiv_procede boolean;
  t_iiv_pdf text;
  borme_estado text;
begin
  if not is_new_status or old_status is null or old_status = new_status then
    return new;
  end if;

  allowed := false;

  if old_status = 'NOTARIO_FIRMADA' and new_status = 'IMPUESTOS_PENDIENTES' then
    allowed := true;

  elsif old_status = 'IMPUESTOS_PENDIENTES' and new_status = 'IMPUESTOS_ACREDITADOS' then
    if coalesce(new.itp_ajd_required, false) = false then
      allowed := true;
    else
      if new.itp_ajd_accreditation_type is not null
         and (new.tax_accredited_at is not null
              or new.itp_ajd_presented_at is not null
              or new.itp_ajd_paid_at is not null) then
        allowed := true;
      end if;
    end if;

    if allowed and coalesce(new.plusvalia_required, false) = true and coalesce(new.plusvalia_mode,'no_procede') <> 'no_procede' then
      if not (new.plusvalia_presented_at is not null or new.plusvalia_paid_at is not null) then
        raise exception 'Debe acreditar la plusvalía (IIVTNU) para avanzar a IMPUESTOS_ACREDITADOS (presentación o pago)';
      end if;
    end if;

  elsif old_status = 'IMPUESTOS_ACREDITADOS' and new_status = 'EN_REGISTRO' then
    if new.registry_submission_date is null then
      raise exception 'Debe indicar la fecha de presentación en el registro para pasar a EN_REGISTRO';
    end if;
    allowed := true;

  elsif old_status = 'EN_REGISTRO' and new_status = 'EN_CALIFICACION' then
    -- Requisito: tributos acreditados con justificantes PDF cuando proceda
    select et.itp_ajd_procede, et.itp_ajd_pdf, et.iivtnu_procede, et.iivtnu_pdf
      into t_itp_procede, t_itp_pdf, t_iiv_procede, t_iiv_pdf
    from public.expedientes_tributos et
    where et.expediente_id = new.id
    limit 1;

    if coalesce(t_itp_procede, false) = true and (t_itp_pdf is null or length(trim(t_itp_pdf)) = 0) then
      raise exception 'No se puede pasar a EN_CALIFICACION: falta justificante PDF de ITP/AJD';
    end if;
    if coalesce(t_iiv_procede, false) = true and (t_iiv_pdf is null or length(trim(t_iiv_pdf)) = 0) then
      raise exception 'No se puede pasar a EN_CALIFICACION: falta justificante PDF de IIVTNU (plusvalía)';
    end if;

    allowed := true;

  elsif old_status = 'EN_CALIFICACION' and new_status in ('INSCRITA','DEFECTOS') then
    if new_status = 'INSCRITA' and new.registration_date is null then
      raise exception 'Debe indicar la fecha de inscripción para pasar a INSCRITA';
    end if;
    allowed := true;

  elsif old_status = 'DEFECTOS' and new_status = 'SUBSANACION' then
    allowed := true;

  elsif old_status = 'SUBSANACION' and new_status = 'EN_CALIFICACION' then
    allowed := true;

  elsif old_status = 'INSCRITA' and new_status in ('BORME_PUBLICADO','CIERRE_EXPEDIENTE') then
    if new_status = 'BORME_PUBLICADO' then
      if new.registry_type <> 'RM' then
        raise exception 'Solo las inscripciones en Registro Mercantil (RM) pueden pasar a BORME_PUBLICADO';
      end if;
      if new.borme_publication_date is null then
        raise exception 'Debe indicar la fecha de publicación en BORME';
      end if;
    end if;
    allowed := true;

  elsif old_status = 'BORME_PUBLICADO' and new_status = 'CIERRE_EXPEDIENTE' then
    allowed := true;
  end if;

  -- Regla adicional: cierre solo con BORME publicado en RM
  if new_status = 'CIERRE_EXPEDIENTE' and new.registry_type = 'RM' then
    select eb.estado into borme_estado
    from public.expedientes_borme eb
    where eb.expediente_id = new.id
    limit 1;

    if coalesce(borme_estado, 'pte') <> 'publicado' then
      raise exception 'No se puede cerrar el expediente: BORME no publicado';
    end if;
  end if;

  if not allowed then
    raise exception 'Transición de estado no permitida: % -> %', old_status, new_status;
  end if;

  -- Coherencia de fechas
  if new.itp_ajd_presented_at is not null and new.itp_ajd_paid_at is not null and new.itp_ajd_paid_at < new.itp_ajd_presented_at then
    raise exception 'La fecha de pago de ITP/AJD no puede ser anterior a la presentación';
  end if;

  if new.plusvalia_presented_at is not null and new.plusvalia_paid_at is not null and new.plusvalia_paid_at < new.plusvalia_presented_at then
    raise exception 'La fecha de pago de plusvalía no puede ser anterior a la presentación';
  end if;

  if new.registry_submission_date is not null and new.registration_date is not null and new.registration_date::date < new.registry_submission_date::date then
    raise exception 'La inscripción no puede ser anterior a la presentación en el registro';
  end if;

  if new.qualification_started_at is not null and new.qualification_completed_at is not null and new.qualification_completed_at < new.qualification_started_at then
    raise exception 'La finalización de calificación no puede ser anterior a su inicio';
  end if;

  return new;
end;
$function$;

-- 2) Validación al crear calificación negativa
CREATE OR REPLACE FUNCTION public.validate_expediente_calificacion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $fn$
begin
  if new.resultado = 'negativa' then
    if new.nota_pdf is null or length(trim(new.nota_pdf)) = 0 then
      raise exception 'Para calificación negativa es obligatorio adjuntar la nota PDF';
    end if;
    if not exists (
      select 1 from public.expedientes_defectos d
      where d.expediente_id = new.expediente_id and d.estado = 'abierto'
    ) then
      raise exception 'Para calificación negativa debe existir al menos un defecto abierto';
    end if;
  end if;
  return new;
end;
$fn$;

DROP TRIGGER IF EXISTS trg_validate_expediente_calificacion ON public.expedientes_calificacion;
CREATE TRIGGER trg_validate_expediente_calificacion
BEFORE INSERT OR UPDATE ON public.expedientes_calificacion
FOR EACH ROW EXECUTE FUNCTION public.validate_expediente_calificacion();