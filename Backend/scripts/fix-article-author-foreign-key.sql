-- Fix the Articles table authorId foreign key constraint
-- This script changes the foreign key from referencing Admins to referencing Authors

-- First, drop the existing constraint
ALTER TABLE "Articles" DROP CONSTRAINT "Articles_authorId_fkey";

-- Then add the correct constraint
ALTER TABLE "Articles"
ADD CONSTRAINT "Articles_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "Authors"("id")
ON UPDATE CASCADE ON DELETE SET NULL;

-- Verify the constraint was created
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM
    information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE
    tc.table_name = 'Articles'
    AND tc.constraint_name = 'Articles_authorId_fkey';