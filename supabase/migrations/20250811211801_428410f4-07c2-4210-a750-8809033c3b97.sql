
-- 1) Nuevos campos operativos para impuestos
alter table public.deeds
  add column if not exists itp_ajd_accreditation_type varchar
    check (itp_ajd_accreditation_type in ('pago','exencion','no_sujecion')),
  add column if not exists plusvalia_mode varchar not null default 'no_procede'
    check (plusvalia_mode in ('no_procede','comunicacion','autoliquidacion','declaracion'));

create index if not exists idx_deeds_plusvalia_mode on public.deeds(plusvalia_mode);

-- 2) Prórroga automática del asiento al entrar en DEFECTOS
create or replace function public.update_deed_sla()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  -- Deadlines por días hábiles
  if new.signing_date is not null then
    new.model600_deadline := public.add_business_days(new.signing_date::date, 30);
  else
    new.model600_deadline := null;
  end if;

  if new.registry_submission_date is not null then
    new.asiento_expiration_date := public.add_business_days(new.registry_submission_date::date, 60);
  else
    new.asiento_expiration_date := null;
  end if;

  -- Si entra en calificación y no hay inicio, fijarlo a now()
  if new.status = 'EN_CALIFICACION' and (new.qualification_started_at is null) then
    new.qualification_started_at := now();
  end if;

  if new.qualification_started_at is not null then
    new.qualification_deadline := public.add_business_days(new.qualification_started_at::date, 15);
  else
    new.qualification_deadline := null;
  end if;

  -- Prórroga automática de asiento si hay calificación negativa (DEFECTOS)
  -- Solo si existe asiento previo (registry_submission_date no nulo)
  if new.status = 'DEFECTOS' and new.registry_submission_date is not null then
    new.asiento_expiration_date := public.add_business_days((current_date + 1)::date, 60);
  end if;

  return new;
end;
$$;

-- Re-crear trigger si hiciera falta (idempotente)
drop trigger if exists trg_deeds_update_sla on public.deeds;
create trigger trg_deeds_update_sla
before insert or update of signing_date, registry_submission_date, qualification_started_at, status
on public.deeds
for each row execute function public.update_deed_sla();

-- 3) Endurecer validaciones en transiciones
create or replace function public.validate_deed_status_transition()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  old_status text := old.status;
  new_status text := new.status;
  is_new_status boolean := new_status in (
    'NOTARIO_FIRMADA','IMPUESTOS_PENDIENTES','IMPUESTOS_ACREDITADOS','EN_REGISTRO',
    'EN_CALIFICACION','DEFECTOS','SUBSANACION','INSCRITA','BORME_PUBLICADO','CIERRE_EXPEDIENTE'
  );
  allowed boolean := true;
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
      -- Debe constar acreditación (pago/exención/no sujeción) y algún justificante (presentación/pago/acreditación)
      if new.itp_ajd_accreditation_type is not null
         and (new.tax_accredited_at is not null
              or new.itp_ajd_presented_at is not null
              or new.itp_ajd_paid_at is not null) then
        allowed := true;
      end if;
    end if;

    -- Plusvalía municipal cuando proceda
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
$$;

drop trigger if exists trg_deeds_validate_transition on public.deeds;
create trigger trg_deeds_validate_transition
before update of status on public.deeds
for each row execute function public.validate_deed_status_transition();

-- 4) Escalado por SLA de calificación: tabla y trigger
create table if not exists public.deed_escalations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  deed_id uuid not null references public.deeds(id) on delete cascade,
  type varchar not null check (type in ('qualification_overdue')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (deed_id, type)
);

alter table public.deed_escalations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='deed_escalations' and policyname='Users can view deed escalations in org'
  ) then
    create policy "Users can view deed escalations in org"
      on public.deed_escalations
      for select
      using (org_id = public.get_user_org_id());
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='deed_escalations' and policyname='Users can insert deed escalations in org'
  ) then
    create policy "Users can insert deed escalations in org"
      on public.deed_escalations
      for insert
      with check (org_id = public.get_user_org_id());
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='deed_escalations' and policyname='Users can update deed escalations in org'
  ) then
    create policy "Users can update deed escalations in org"
      on public.deed_escalations
      for update
      using (org_id = public.get_user_org_id());
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='deed_escalations' and policyname='Users can delete deed escalations in org'
  ) then
    create policy "Users can delete deed escalations in org"
      on public.deed_escalations
      for delete
      using (org_id = public.get_user_org_id());
  end if;
end$$;

create or replace function public.check_deed_sla_escalations()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  -- Si está en calificación o con defectos y venció el SLA de calificación, crear escalado
  if new.qualification_deadline is not null
     and current_date > new.qualification_deadline
     and new.status in ('EN_CALIFICACION','DEFECTOS') then
    insert into public.deed_escalations (org_id, deed_id, type)
    values (new.org_id, new.id, 'qualification_overdue')
    on conflict (deed_id, type) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_deeds_check_escalations on public.deeds;
create trigger trg_deeds_check_escalations
after insert or update of status, qualification_deadline
on public.deeds
for each row execute function public.check_deed_sla_escalations();
