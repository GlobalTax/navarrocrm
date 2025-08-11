
-- 1) Ampliar tabla deeds con campos operativos (impuestos, registro, BORME, cierre, SLAs)
alter table public.deeds
  add column if not exists submission_channel varchar not null default 'telematica' check (submission_channel in ('telematica','presencial')),
  add column if not exists registry_type varchar not null default 'RP' check (registry_type in ('RP','RM')),
  add column if not exists itp_ajd_required boolean,
  add column if not exists model_600_number varchar,
  add column if not exists itp_ajd_presented_at timestamptz,
  add column if not exists itp_ajd_paid_at timestamptz,
  add column if not exists tax_accredited_at timestamptz,
  add column if not exists plusvalia_required boolean,
  add column if not exists plusvalia_ref varchar,
  add column if not exists plusvalia_presented_at timestamptz,
  add column if not exists plusvalia_paid_at timestamptz,
  add column if not exists presentation_entry varchar,
  add column if not exists asiento_expiration_date date,
  add column if not exists qualification_started_at timestamptz,
  add column if not exists qualification_deadline date,
  add column if not exists qualification_completed_at timestamptz,
  add column if not exists inscription_number varchar,
  add column if not exists borme_publication_date date,
  add column if not exists borme_ref varchar,
  add column if not exists close_date date,
  add column if not exists close_reason text,
  add column if not exists closure_notes text,
  add column if not exists model600_deadline date;

-- 2) Tabla de historial de estado
create table if not exists public.deeds_status_history (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  deed_id uuid not null references public.deeds(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  changed_by uuid not null references public.users(id),
  changed_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_deeds_status_org on public.deeds(org_id, status);
create index if not exists idx_deeds_model600_deadline on public.deeds(model600_deadline);
create index if not exists idx_deeds_asiento_expiry on public.deeds(asiento_expiration_date);
create index if not exists idx_deeds_qualification_deadline on public.deeds(qualification_deadline);
create index if not exists idx_deeds_history_deed_at on public.deeds_status_history(deed_id, changed_at desc);

-- 3) RLS para historial
alter table public.deeds_status_history enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='deeds_status_history' and policyname='Users can view deed status history in their org'
  ) then
    create policy "Users can view deed status history in their org"
      on public.deeds_status_history
      for select
      using (org_id = public.get_user_org_id());
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='deeds_status_history' and policyname='Users can insert deed status history in their org'
  ) then
    create policy "Users can insert deed status history in their org"
      on public.deeds_status_history
      for insert
      with check (org_id = public.get_user_org_id() and changed_by = auth.uid());
  end if;
end$$;

-- 4) Función para sumar días hábiles (excluye sábados y domingos)
create or replace function public.add_business_days(start_date date, days integer)
returns date
language plpgsql
security definer
set search_path to ''
as $$
declare
  d date := start_date;
  i integer := 0;
begin
  if start_date is null or days is null then
    return null;
  end if;
  while i < days loop
    d := d + interval '1 day';
    -- 0 = domingo, 6 = sábado
    if extract(dow from d) not in (0, 6) then
      i := i + 1;
    end if;
  end loop;
  return d::date;
end;
$$;

-- 5) Función: actualizar SLAs automáticamente
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

  return new;
end;
$$;

-- 6) Función: validar transiciones y requisitos
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
  -- Solo validar si el nuevo estado pertenece al pipeline propuesto
  if not is_new_status or old_status is null or old_status = new_status then
    return new;
  end if;

  allowed := false;

  if old_status = 'NOTARIO_FIRMADA' and new_status = 'IMPUESTOS_PENDIENTES' then
    allowed := true;

  elsif old_status = 'IMPUESTOS_PENDIENTES' and new_status = 'IMPUESTOS_ACREDITADOS' then
    if coalesce(new.itp_ajd_required, false) = false then
      -- No requiere ITP/AJD
      allowed := true;
    else
      if new.tax_accredited_at is not null
         or new.itp_ajd_presented_at is not null
         or new.itp_ajd_paid_at is not null then
        allowed := true;
      end if;
    end if;

    if allowed and coalesce(new.plusvalia_required, false) = true then
      if not (new.plusvalia_presented_at is not null or new.plusvalia_paid_at is not null) then
        raise exception 'Debe acreditar la plusvalía (IIVTNU) para avanzar a IMPUESTOS_ACREDITADOS';
      end if;
    end if;

  elsif old_status = 'IMPUESTOS_ACREDITADOS' and new_status = 'EN_REGISTRO' then
    if new.registry_submission_date is null then
      raise exception 'Debe indicar la fecha de presentación en el registro para pasar a EN_REGISTRO';
    end if;
    allowed := true;

  elsif old_status = 'EN_REGISTRO' and new_status = 'EN_CALIFICACION' then
    -- Se permite; qualification_started_at se autocompleta en update_deed_sla
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

  -- Validaciones de coherencia de fechas
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

-- 7) Función: log de historial de estado
create or replace function public.log_deed_status_history()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.deeds_status_history (org_id, deed_id, from_status, to_status, changed_by, note)
    values (new.org_id, new.id, old.status, new.status, auth.uid(), null);
  end if;
  return new;
end;
$$;

-- 8) Triggers
drop trigger if exists trg_deeds_update_sla on public.deeds;
create trigger trg_deeds_update_sla
before insert or update of signing_date, registry_submission_date, qualification_started_at, status
on public.deeds
for each row execute function public.update_deed_sla();

drop trigger if exists trg_deeds_validate_transition on public.deeds;
create trigger trg_deeds_validate_transition
before update of status on public.deeds
for each row execute function public.validate_deed_status_transition();

drop trigger if exists trg_deeds_status_history on public.deeds;
create trigger trg_deeds_status_history
after update of status on public.deeds
for each row execute function public.log_deed_status_history();

-- 9) Añadir a publicación realtime (para escuchar historial si interesa)
do $$
begin
  perform 1 from pg_publication_tables 
   where pubname = 'supabase_realtime' and schemaname='public' and tablename='deeds_status_history';
  if not found then
    alter publication supabase_realtime add table public.deeds_status_history;
  end if;
end$$;
