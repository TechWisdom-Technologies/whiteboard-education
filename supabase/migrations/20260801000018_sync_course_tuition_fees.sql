-- Migration: Backfill tuition_fee column from yearly_fees for courses where tuition_fee is 0 or NULL
-- Safe & non-destructive: only updates courses that have yearly_fees but no tuition_fee set.

UPDATE public.courses
SET tuition_fee = (
  regexp_replace(yearly_fees->0->>'fee', '[^0-9.]', '', 'g')
)::numeric
WHERE (tuition_fee IS NULL OR tuition_fee = 0)
  AND yearly_fees IS NOT NULL
  AND jsonb_typeof(yearly_fees) = 'array'
  AND jsonb_array_length(yearly_fees) > 0
  AND (yearly_fees->0->>'fee') IS NOT NULL
  AND regexp_replace(yearly_fees->0->>'fee', '[^0-9.]', '', 'g') ~ '^[0-9]+(\.[0-9]+)?$';

