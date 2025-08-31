-- Schema & RLS for CreditCraft

create table if not exists profiles (
  id uuid primary key references auth.users not null,
  email text,
  display_name text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  created_at timestamptz default now()
);

create table if not exists credit_reports (
  id uuid primary key,
  user_id uuid not null,
  bureau text check (bureau in ('equifax','experian','transunion')),
  src_path text not null,
  period_start date,
  period_end date,
  status text not null default 'uploaded',
  parsed_at timestamptz,
  summary jsonb,
  created_at timestamptz default now()
);

create table if not exists tradelines (
  id uuid primary key,
  report_id uuid not null references credit_reports(id) on delete cascade,
  creditor text,
  acct_mask text,
  type text,
  balance numeric,
  credit_limit numeric,
  status text,
  opened_date date,
  last_reported date,
  late_30 int default 0,
  late_60 int default 0,
  late_90 int default 0
);

create table if not exists dispute_candidates (
  id uuid primary key,
  user_id uuid not null,
  report_id uuid not null,
  tradeline_id uuid null,
  kind text,
  rationale text,
  confidence numeric,
  created_at timestamptz default now()
);

create table if not exists disputes (
  id uuid primary key,
  user_id uuid not null,
  bureau text not null,
  items jsonb not null,
  letter_pdf_path text,
  status text not null default 'draft',
  mailed_at timestamptz,
  due_at timestamptz,
  outcome text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key,
  user_id uuid not null,
  dispute_id uuid,
  type text,
  message text,
  link text,
  read boolean default false,
  created_at timestamptz default now(),
  notify_date date default current_date
);

create table if not exists last_cron_run (
  name text primary key,
  ran_at timestamptz
);

create table if not exists audit_access (
  id uuid primary key,
  user_id uuid not null,
  actor uuid,
  resource text,
  action text,
  details jsonb,
  created_at timestamptz default now()
);

create table if not exists consents (
  user_id uuid primary key references auth.users on delete cascade,
  consented_at timestamptz default now()
);

-- Indexes
create index if not exists credit_reports_user_idx on credit_reports(user_id);
create index if not exists dispute_candidates_user_idx on dispute_candidates(user_id);
create index if not exists disputes_user_idx on disputes(user_id);
create index if not exists notifications_user_idx on notifications(user_id);
create unique index if not exists notifications_dispute_type_date_key on notifications(dispute_id, type, notify_date) where dispute_id is not null and type is not null;
create index if not exists dispute_candidates_report_idx on dispute_candidates(report_id);
create index if not exists tradelines_report_idx on tradelines(report_id);

-- RLS
alter table profiles enable row level security;
alter table credit_reports enable row level security;
alter table tradelines enable row level security;
alter table dispute_candidates enable row level security;
alter table disputes enable row level security;
alter table notifications enable row level security;
alter table audit_access enable row level security;
alter table consents enable row level security;
alter table last_cron_run enable row level security;

create policy "Profiles are viewable by owner" on profiles for select using ( id = auth.uid() );
create policy "Profiles are insertable by owner" on profiles for insert with check ( id = auth.uid() );
create policy "Profiles are updatable by owner" on profiles for update using ( id = auth.uid() );

create policy "Reports by owner" on credit_reports for all using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );
create policy "Tradelines by owner" on tradelines for all
  using (
    exists (
      select 1 from credit_reports cr
      where cr.id = report_id and cr.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from credit_reports cr
      where cr.id = report_id and cr.user_id = auth.uid()
    )
  );
create policy "Candidates by owner" on dispute_candidates for all using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );
create policy "Disputes by owner" on disputes for all using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );
create policy "Notifications by owner" on notifications for all using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );
create policy "Audit read by owner" on audit_access for select using ( user_id = auth.uid() );
create policy "Audit insert by owner" on audit_access for insert with check ( user_id = auth.uid() );
create policy "Consents by owner" on consents for all using ( user_id = auth.uid() ) with check ( user_id = auth.uid() );
create policy "Cron run by service role" on last_cron_run for all using ( auth.role() = 'service_role' ) with check ( auth.role() = 'service_role' );

-- Trigger to insert profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- View for disputes due in 48h
create or replace view disputes_due_48h as
  select * from disputes
  where status = 'sent'
    and due_at < now() + interval '48 hours';
