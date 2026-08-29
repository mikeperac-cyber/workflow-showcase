create extension if not exists pgcrypto;

create table if not exists app_user (
  id uuid primary key,
  auth0_subject text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists workspace (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now()
);

do $$ begin
  create type workspace_role as enum ('owner', 'editor', 'commenter', 'viewer');
exception when duplicate_object then null;
end $$;

create table if not exists workspace_membership (
  workspace_id uuid not null references workspace(id) on delete cascade,
  user_id uuid not null references app_user(id) on delete cascade,
  role workspace_role not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists workflow (
  id uuid primary key,
  workspace_id uuid not null references workspace(id) on delete cascade,
  name text not null,
  description text not null default '',
  schema_version integer not null default 1,
  head_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workflow_revision (
  id uuid primary key,
  workflow_id uuid not null references workflow(id) on delete cascade,
  version integer not null,
  document jsonb not null,
  created_by uuid not null references app_user(id),
  created_at timestamptz not null default now(),
  unique (workflow_id, version)
);

do $$ begin
  alter table workflow add constraint workflow_head_revision_fk
    foreign key (head_revision_id) references workflow_revision(id) deferrable initially deferred;
exception when duplicate_object then null;
end $$;

create table if not exists workflow_run (
  id uuid primary key,
  workflow_id uuid not null references workflow(id),
  revision_id uuid not null references workflow_revision(id),
  status text not null check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  created_by uuid not null references app_user(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
