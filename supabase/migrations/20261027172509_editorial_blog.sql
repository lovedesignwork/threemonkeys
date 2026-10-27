-- Editorial publishing uses the server-side authenticated admin API.
alter table public.blog_posts add column if not exists status text not null default 'draft' check (status in ('draft','published'));
alter table public.blog_posts add column if not exists featured_image text;
alter table public.blog_posts add column if not exists seo_title text;
alter table public.blog_posts add column if not exists seo_description text;
alter table public.blog_posts add column if not exists focus_keyword text;
alter table public.blog_posts add column if not exists image_manifest jsonb not null default '[]';
update public.blog_posts set status = case when is_published then 'published' else 'draft' end, featured_image = image_url;
alter table public.blog_posts enable row level security;
drop policy if exists "Public can read published blog posts" on public.blog_posts;
drop policy if exists "Service role full access blog_posts" on public.blog_posts;
revoke all on public.blog_posts from anon, authenticated;
grant all on public.blog_posts to service_role;

create table public.blog_media (
 id uuid primary key default gen_random_uuid(),
 src text not null unique,
 source_hash text not null unique,
 fingerprint text not null,
 source_name text not null,
 width integer not null check(width > 0),
 height integer not null check(height > 0),
 variants jsonb not null default '[]',
 alt text not null,
 caption text not null,
 generated boolean not null default false,
 -- Deliberately not a foreign key: ownership survives article deletion.
 owner_id uuid,
 created_at timestamptz not null default now()
);
alter table public.blog_media enable row level security;
revoke all on public.blog_media from anon, authenticated;
grant all on public.blog_media to service_role;

create or replace function public.claim_blog_media() returns trigger
language plpgsql security invoker set search_path = public as $$
declare media_id uuid; claimed uuid;
begin
 new.is_published := new.status = 'published';
 new.updated_at := now();
 if new.status = 'published' and new.published_at is null then new.published_at := now(); end if;
 for media_id in select (item->>'id')::uuid from jsonb_array_elements(new.image_manifest) item loop
   update public.blog_media set owner_id = new.id
   where id = media_id and (owner_id is null or owner_id = new.id) returning id into claimed;
   if claimed is null then raise exception 'An image is unavailable or belongs to another article'; end if;
 end loop;
 return new;
end;
$$;
revoke all on function public.claim_blog_media() from public, anon, authenticated;
create trigger claim_blog_media_before_save before insert or update on public.blog_posts
for each row execute function public.claim_blog_media();
create index blog_posts_public_order on public.blog_posts (published_at desc, id) where status = 'published';
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('blog-images','blog-images',true,10485760,array['image/webp'])
on conflict (id) do nothing;
