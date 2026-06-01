-- Supabase Row Level Security (RLS) helpers for `master_list`
-- Recommended: create policies that allow authenticated users to read/write.
-- Run these in the SQL editor in the Supabase dashboard (or via psql using a service_role key).

-- Enable RLS if you haven't already (Supabase may enable by default):
-- ALTER TABLE public.master_list ENABLE ROW LEVEL SECURITY;

-- OPTION A (recommended): Allow authenticated users to select/insert/update/delete
CREATE POLICY "Allow authenticated selects on master_list"
  ON public.master_list
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated inserts on master_list"
  ON public.master_list
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated updates on master_list"
  ON public.master_list
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes on master_list"
  ON public.master_list
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- OPTION B (temporary / NOT recommended for production): Allow public reads/writes
-- Use only if you understand the security implications.
-- CREATE POLICY "Allow public read" ON public.master_list FOR SELECT USING (true);
-- CREATE POLICY "Allow public write" ON public.master_list FOR INSERT WITH CHECK (true);

-- To disable RLS entirely (not recommended):
-- ALTER TABLE public.master_list DISABLE ROW LEVEL SECURITY;

-- Note: Policies created with the Dashboard UI are equivalent; prefer the SQL editor
-- to version-control policy changes.
