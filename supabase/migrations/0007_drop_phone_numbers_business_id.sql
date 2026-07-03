-- Drop the legacy phone_numbers.business_id column. The current schema
-- (0001_init.sql) never defined it; it only exists as drift on older remote
-- databases, where 0003 already dropped its NOT NULL constraint. The app resolves
-- a number's business through its assistant and never reads or writes this column
-- (verified: no query in lib/ or app/ references phone_numbers.business_id).
--
-- `drop column if exists` is idempotent — a no-op on clean databases built from
-- the migrations, and it auto-drops any index or FK constraint that depended on
-- the column.
alter table public.phone_numbers drop column if exists business_id;
