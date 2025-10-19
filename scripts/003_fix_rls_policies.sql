-- Fix Row Level Security policies to allow updates

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active items" ON items;
DROP POLICY IF EXISTS "Anyone can create items" ON items;
DROP POLICY IF EXISTS "Anyone can update items" ON items;

-- Create policy to allow anyone to read all items (for browse and dashboard)
CREATE POLICY "Anyone can view items" ON items
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert items
CREATE POLICY "Anyone can create items" ON items
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to update any item
-- (In production, you'd want to restrict this to the item owner)
CREATE POLICY "Anyone can update items" ON items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow anyone to delete any item
-- (In production, you'd want to restrict this to the item owner)
CREATE POLICY "Anyone can delete items" ON items
  FOR DELETE
  USING (true);
