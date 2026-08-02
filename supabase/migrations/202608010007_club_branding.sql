-- Club branding is public information so the login screen can be branded before authentication.
create policy "public read club branding" on public.clubs for select to anon using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('club-logos', 'club-logos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

create policy "public read club logos" on storage.objects for select using (bucket_id = 'club-logos');
create policy "staff upload club logos" on storage.objects for insert to authenticated with check (bucket_id = 'club-logos' and public.can_edit());
create policy "staff update club logos" on storage.objects for update to authenticated using (bucket_id = 'club-logos' and public.can_edit()) with check (bucket_id = 'club-logos' and public.can_edit());
create policy "staff delete club logos" on storage.objects for delete to authenticated using (bucket_id = 'club-logos' and public.can_edit());
