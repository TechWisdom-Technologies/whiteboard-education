-- Persist admin notification read/unread states per admin user
create table if not exists public.admin_notification_reads (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  notification_key text not null,
  is_read boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (admin_user_id, notification_key)
);

alter table public.admin_notification_reads enable row level security;

-- Admins can view their own read-state rows
create policy "Admins can view own notification reads"
on public.admin_notification_reads
for select
to authenticated
using (admin_user_id = auth.uid() and public.has_role(auth.uid(), 'admin'));

-- Admins can insert their own read-state rows
create policy "Admins can insert own notification reads"
on public.admin_notification_reads
for insert
to authenticated
with check (admin_user_id = auth.uid() and public.has_role(auth.uid(), 'admin'));

-- Admins can update their own read-state rows
create policy "Admins can update own notification reads"
on public.admin_notification_reads
for update
to authenticated
using (admin_user_id = auth.uid() and public.has_role(auth.uid(), 'admin'))
with check (admin_user_id = auth.uid() and public.has_role(auth.uid(), 'admin'));

-- Admins can delete their own read-state rows
create policy "Admins can delete own notification reads"
on public.admin_notification_reads
for delete
to authenticated
using (admin_user_id = auth.uid() and public.has_role(auth.uid(), 'admin'));
