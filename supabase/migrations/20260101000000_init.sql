-- Категорії меню
CREATE TABLE menu_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text,
  description text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamp default now()
);

-- Позиції меню
CREATE TABLE menu_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  category_id uuid references menu_categories(id),
  name text,
  description text,
  weight text,
  price numeric(10,2),
  image_url text,
  badges text[],
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Опції / доплати
CREATE TABLE menu_addons (
  id uuid primary key default gen_random_uuid(),
  name text,
  price_min numeric(10,2),
  price_max numeric(10,2),
  sort_order int default 0
);

-- Контент сайту
CREATE TABLE site_content (
  id uuid primary key default gen_random_uuid(),
  section text unique,
  content jsonb,
  updated_at timestamp default now()
);

-- Галерея фото
CREATE TABLE gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  alt text,
  sort_order int,
  is_active boolean default true,
  created_at timestamp default now()
);

-- Відгуки клієнтів
CREATE TABLE reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text,
  rating int check (rating between 1 and 5),
  text text,
  contact text,
  status text default 'pending',
  reply text,
  created_at timestamp default now(),
  published_at timestamp
);

-- Заявки з форм
CREATE TABLE leads (
  id uuid primary key default gen_random_uuid(),
  type text,
  name text,
  phone text,
  email text,
  message text,
  status text default 'new',
  created_at timestamp default now()
);
