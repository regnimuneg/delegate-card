-- Migration: Remove old conf_day*_food columns
-- These have been replaced with separate breakfast and lunch columns

-- For delegates table
ALTER TABLE delegates
    DROP COLUMN IF EXISTS conf_day1_food,
    DROP COLUMN IF EXISTS conf_day2_food,
    DROP COLUMN IF EXISTS conf_day3_food;

-- For members table
ALTER TABLE members
    DROP COLUMN IF EXISTS conf_day1_food,
    DROP COLUMN IF EXISTS conf_day2_food,
    DROP COLUMN IF EXISTS conf_day3_food;
