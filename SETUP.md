# CB Friends Inventory — Setup Guide

## Step 1: Install Node.js

Download and install from: https://nodejs.org (LTS version)

After installing, open a new terminal and verify:
```
node --version
npm --version
```

---

## Step 2: Set up Supabase

1. Go to https://supabase.com and create a free account + new project.
2. In the Supabase dashboard, go to **SQL Editor** and run the contents of `supabase-setup.sql` (below).
3. Go to **Project Settings → API** and copy:
   - Project URL
   - anon/public key

---

## Step 3: Configure environment variables

Open `.env` in the project folder and replace the placeholder values:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

---

## Step 4: Install dependencies and run

Open a terminal in this folder (`cb-friends-inventory`) and run:

```bash
npm install
npm run dev
```

The app will open at http://localhost:5173

---

## Step 5: Deploy (optional)

Push to GitHub, then connect to Vercel or Netlify. Add the two env vars in the hosting dashboard.

---

## Default PINs

- **Access PIN:** `1234`
- **Admin PIN:** `0000`

Change these immediately via Admin → Settings after first login.

---

## Supabase SQL (run this in SQL Editor)

```sql
-- Books table
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn TEXT,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'removed')),
  date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_out TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX idx_books_status ON books (status);
CREATE INDEX idx_books_date_added ON books (date_added);
CREATE INDEX idx_books_isbn ON books (isbn);

-- Settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES ('access_pin', '1234');
INSERT INTO settings (key, value) VALUES ('admin_pin', '0000');

-- Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON books FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON settings FOR ALL USING (true) WITH CHECK (true);
```
