-- 1) Columns for automatic capture
alter table public.deeds
  add column if not exists protocol_number text,
  add column if not exists notary_name text,
  add column if not exists asiento_number text;

-- 2) Storage bucket for deed documents
insert into storage.buckets (id, name, public)
values ('deed_docs','deed_docs', false)
on conflict (id) do nothing;

-- 3) RLS policies on storage.objects for deed_docs (user folder isolation)
-- Drop existing with same names if present to avoid duplicates
drop policy if exists "Deed docs: users can upload to own folder" on storage.objects;
drop policy if exists "Deed docs: users can update own files" on storage.objects;
drop policy if exists "Deed docs: users can read own files" on storage.objects;
drop policy if exists "Deed docs: users can delete own files" on storage.objects;

create policy "Deed docs: users can upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'deed_docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Deed docs: users can update own files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'deed_docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'deed_docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Deed docs: users can read own files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'deed_docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Deed docs: users can delete own files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'deed_docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );