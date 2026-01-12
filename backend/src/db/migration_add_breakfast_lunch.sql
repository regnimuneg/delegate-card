-- Migration: Add separate breakfast and lunch columns for conference days
-- Replaces single food column with breakfast and lunch columns
-- Opening ceremony keeps single food column (catering)

-- For delegates table
ALTER TABLE delegates
    ADD COLUMN IF NOT EXISTS conf_day1_breakfast BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conf_day1_lunch BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conf_day2_breakfast BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conf_day2_lunch BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conf_day3_breakfast BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conf_day3_lunch BOOLEAN DEFAULT FALSE;

-- Migrate existing data: if conf_day*_food was TRUE, set both breakfast and lunch to TRUE
UPDATE delegates
SET 
    conf_day1_breakfast = conf_day1_food,
    conf_day1_lunch = conf_day1_food,
    conf_day2_breakfast = conf_day2_food,
    conf_day2_lunch = conf_day2_food,
    conf_day3_breakfast = conf_day3_food,
    conf_day3_lunch = conf_day3_food
WHERE conf_day1_food = TRUE OR conf_day2_food = TRUE OR conf_day3_food = TRUE;

-- For members table
ALTER TABLE members
    ADD COLUMN IF NOT EXISTS conf_day1_breakfast BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conf_day1_lunch BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conf_day2_breakfast BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conf_day2_lunch BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conf_day3_breakfast BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS conf_day3_lunch BOOLEAN DEFAULT FALSE;

-- Migrate existing data for members
UPDATE members
SET 
    conf_day1_breakfast = conf_day1_food,
    conf_day1_lunch = conf_day1_food,
    conf_day2_breakfast = conf_day2_food,
    conf_day2_lunch = conf_day2_food,
    conf_day3_breakfast = conf_day3_food,
    conf_day3_lunch = conf_day3_food
WHERE conf_day1_food = TRUE OR conf_day2_food = TRUE OR conf_day3_food = TRUE;

-- Note: We keep the old conf_day*_food columns for now to avoid breaking existing code
-- They can be dropped later after updating all code that references them
-- DROP COLUMN conf_day1_food, conf_day2_food, conf_day3_food;
