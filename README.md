# Bukit Activities — Fresh Starter

This workspace was reset to a minimal Vite + React starter.

Quick start:

```bash
npm install
npm run dev
```

Supabase setup:

1. Create a Supabase project and copy the Project URL and anon key.
2. Add a `.env` file at the repo root with these values (Vite needs `VITE_` prefix):

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

Important: If you see an "invalid API key" error, make sure you copied the **anon (public)** key from Supabase (Project → Settings → API → anon public key). Do not use other publishable keys.
```

3. Start the dev server and the app will use those env vars via `import.meta.env`.

Files created:
- package.json, vite.config.js, index.html
- src/main.jsx, src/App.jsx, src/styles.css, src/supabaseClient.js

If you want a different stack or TypeScript, tell me and I will re-scaffold.

Supabase Row Level Security (RLS)

- If you see the error "new row violates row-level security policy for table \"master_list\"", it means RLS is enabled and there is no policy allowing your client to insert rows.
- Fix options:
	- Preferred: create policies that allow authenticated users to read/write. See `supabase_policy.sql` for example SQL you can run in the Supabase SQL editor.
	- For quick testing only: disable RLS in the Table Editor or run `ALTER TABLE public.master_list DISABLE ROW LEVEL SECURITY;` (not recommended for production).
	- Ensure your client uses the anon (public) key for browser clients and that users are authenticated if your policies require it.

I added `supabase_policy.sql` with sample policies you can apply in the Supabase SQL editor.
