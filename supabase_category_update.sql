-- Wedding Invitation Database Schema Update
-- Add category field and remove from_side constraint for flexible guest categorization

-- 1. Remove the CHECK constraint on from_side to allow flexible values
ALTER TABLE guests DROP CONSTRAINT IF EXISTS guests_from_side_check;

-- 2. Add category column for guest categorization (teman/keluarga/kolega/etc)
ALTER TABLE guests ADD COLUMN IF NOT EXISTS category TEXT;

-- 3. Update column comments to reflect the changes
COMMENT ON COLUMN guests.from_side IS 'Flexible guest category - can be adel, eko, mamak adel, mbah epi, etc.';
COMMENT ON COLUMN guests.category IS 'Guest relationship category - keluarga, teman, kolega, etc.';

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guests_from_side_lower ON guests (LOWER(from_side));
CREATE INDEX IF NOT EXISTS idx_guests_category_lower ON guests (LOWER(category));

-- 5. Optional: Normalize existing from_side values to lowercase
UPDATE guests 
SET from_side = LOWER(TRIM(from_side))
WHERE from_side IS NOT NULL;

-- 6. Optional: Set default category for existing guests
UPDATE guests 
SET category = 'keluarga'
WHERE category IS NULL;

-- 7. Verification queries
-- Check current from_side distribution
SELECT 
    from_side,
    COUNT(*) as guest_count,
    STRING_AGG(name, ', ' ORDER BY name LIMIT 3) as sample_guests
FROM guests 
GROUP BY from_side 
ORDER BY guest_count DESC;

-- Check current category distribution
SELECT 
    category,
    COUNT(*) as guest_count,
    STRING_AGG(name, ', ' ORDER BY name LIMIT 3) as sample_guests
FROM guests 
WHERE category IS NOT NULL
GROUP BY category 
ORDER BY guest_count DESC;

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'guests' 
AND column_name IN ('from_side', 'category')
ORDER BY ordinal_position;
