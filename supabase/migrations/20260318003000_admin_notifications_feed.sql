-- Event-based admin notifications feed
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,
  source_id text not null,
  event_type text not null,
  title text not null,
  message text not null,
  href text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source_table, source_id, event_type)
);

alter table public.admin_notifications enable row level security;

create policy "Admins can read admin notifications"
on public.admin_notifications
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Trigger: new lead created
create or replace function public.notify_admin_new_lead()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'new' then
    insert into public.admin_notifications (source_table, source_id, event_type, title, message, href, metadata)
    values (
      'leads',
      new.id::text,
      'lead_created',
      'New Lead',
      coalesce(new.full_name, new.email, 'Unknown') || ' submitted an inquiry',
      '/admin/leads',
      jsonb_build_object('leadId', new.id, 'email', new.email)
    )
    on conflict (source_table, source_id, event_type) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_admin_notify_new_lead on public.leads;
create trigger trg_admin_notify_new_lead
after insert on public.leads
for each row
execute function public.notify_admin_new_lead();

-- Trigger: partner registration pending
create or replace function public.notify_admin_partner_pending()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    insert into public.admin_notifications (source_table, source_id, event_type, title, message, href, metadata)
    values (
      'partner_registrations',
      new.id::text,
      'partner_pending',
      'Partner Approval Pending',
      coalesce(new.agency_name, 'Agency') || ' (' || coalesce(new.contact_person, 'Contact') || ') is waiting for approval',
      '/admin/partners',
      jsonb_build_object('registrationId', new.id)
    )
    on conflict (source_table, source_id, event_type) do nothing;
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status and new.status = 'pending' then
    insert into public.admin_notifications (source_table, source_id, event_type, title, message, href, metadata)
    values (
      'partner_registrations',
      new.id::text,
      'partner_pending_reopened',
      'Partner Pending Again',
      coalesce(new.agency_name, 'Agency') || ' moved back to pending review',
      '/admin/partners',
      jsonb_build_object('registrationId', new.id)
    )
    on conflict (source_table, source_id, event_type) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_admin_notify_partner_pending on public.partner_registrations;
create trigger trg_admin_notify_partner_pending
after insert or update on public.partner_registrations
for each row
execute function public.notify_admin_partner_pending();

-- Trigger: student moved to document review
create or replace function public.notify_admin_student_doc_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'document_review' and (tg_op = 'INSERT' or new.status is distinct from old.status) then
    insert into public.admin_notifications (source_table, source_id, event_type, title, message, href, metadata)
    values (
      'students',
      new.id::text,
      'student_document_review',
      'Student in Document Review',
      coalesce(new.full_name, 'Student') || ' (' || coalesce(new.target_university, 'No university') || ') needs review',
      '/admin/students',
      jsonb_build_object('studentId', new.id)
    )
    on conflict (source_table, source_id, event_type) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_admin_notify_student_doc_review on public.students;
create trigger trg_admin_notify_student_doc_review
after insert or update on public.students
for each row
execute function public.notify_admin_student_doc_review();
