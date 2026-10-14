insert into storage.buckets (id, name, public, file_size_limit)
values ('threat-photos', 'threat-photos', true, 5242880)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "Usuarios autenticados pueden subir sus fotos de reportes"
  on storage.objects;
create policy "Usuarios autenticados pueden subir sus fotos de reportes"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'threat-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuarios pueden borrar sus fotos de reportes"
  on storage.objects;
create policy "Usuarios pueden borrar sus fotos de reportes"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'threat-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );