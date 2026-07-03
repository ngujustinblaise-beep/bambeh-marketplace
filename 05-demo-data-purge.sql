-- =====================================================================
-- 05-demo-data-purge.sql  -- Removes prototype/demo/sample listings
-- from the LIVE database. Run in Supabase SQL Editor.
--
-- SAFETY PROTOCOL (do not skip):
--   1. FIRST export each table as CSV: Supabase -> Table Editor ->
--      open table -> three dots (top right) -> Export data as CSV.
--      That CSV is your rollback.
--   2. Run PART A (previews). READ every row it returns.
--   3. Only rows you confirm are demo junk get deleted by PART B.
--      PART B is commented out on purpose -- uncomment per table
--      ONLY after you approved the preview for that table.
-- =====================================================================

-- ---------------------------------------------------------------
-- PART A: PREVIEW -- shows suspected demo rows, deletes NOTHING
-- ---------------------------------------------------------------
SELECT 'listings' AS tbl, id, title, created_at FROM public.listings
 WHERE title ~* '(demo|sample|test|lorem|example|placeholder|dummy)'
UNION ALL
SELECT 'marketplace_listings', id, title, created_at FROM public.marketplace_listings
 WHERE title ~* '(demo|sample|test|lorem|example|placeholder|dummy)'
UNION ALL
SELECT 'job_listings', id, title, created_at FROM public.job_listings
 WHERE title ~* '(demo|sample|test|lorem|example|placeholder|dummy)'
UNION ALL
SELECT 'farm_products', id, title, created_at FROM public.farm_products
 WHERE title ~* '(demo|sample|test|lorem|example|placeholder|dummy)'
UNION ALL
SELECT 'exchange_items', id, title, created_at FROM public.exchange_items
 WHERE title ~* '(demo|sample|test|lorem|example|placeholder|dummy)'
ORDER BY tbl, created_at;

-- If a table above errors because its title column is named differently
-- (e.g. jobs uses a different name), tell me the error text and I adjust.

-- ---------------------------------------------------------------
-- PART B: DELETE -- uncomment ONE table at a time, only after you
-- approved its preview rows AND exported its CSV backup.
-- ---------------------------------------------------------------
-- DELETE FROM public.listings
--  WHERE title ~* '(demo|sample|test|lorem|example|placeholder|dummy)';
-- DELETE FROM public.marketplace_listings
--  WHERE title ~* '(demo|sample|test|lorem|example|placeholder|dummy)';
-- DELETE FROM public.job_listings
--  WHERE title ~* '(demo|sample|test|lorem|example|placeholder|dummy)';
-- DELETE FROM public.farm_products
--  WHERE title ~* '(demo|sample|test|lorem|example|placeholder|dummy)';
-- DELETE FROM public.exchange_items
--  WHERE title ~* '(demo|sample|test|lorem|example|placeholder|dummy)';

-- NOTE: the "Showing sample listings" text on the Services page and the
-- demo fallback ARRAYS live in FRONTEND CODE (the F-10 pattern), not in
-- the database. Deleting DB rows will not remove those. Upload the
-- Services/Jobs page files and I will strip the fallback arrays
-- surgically with a .Replace script.
