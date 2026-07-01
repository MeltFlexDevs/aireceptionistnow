-- Schema drift fix: some remote databases carry a legacy phone_numbers.business_id
-- column with a NOT NULL constraint that the current schema (0001_init.sql) does
-- not define. The app resolves a number's business through its assistant, so it
-- never sets business_id, and the constraint breaks number creation with:
--   null value in column "business_id" of relation "phone_numbers" violates
--   not-null constraint
--
-- Drop the NOT NULL where the column exists. Guarded so it's a no-op on clean
-- databases built straight from the migrations (which have no such column).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'phone_numbers'
      and column_name = 'business_id'
  ) then
    alter table public.phone_numbers alter column business_id drop not null;
  end if;
end $$;
