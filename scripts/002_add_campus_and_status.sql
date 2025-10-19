-- Add campus field to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS campus TEXT;

-- Update status check constraint to include more options
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_status_check;
ALTER TABLE items ADD CONSTRAINT items_status_check 
  CHECK (status IN ('active', 'resolved', 'at_security', 'returned'));

-- Add index for campus filtering
CREATE INDEX IF NOT EXISTS idx_items_campus ON items(campus);

-- Update the view policy to show items at security too
DROP POLICY IF EXISTS "Anyone can view active items" ON items;
CREATE POLICY "Anyone can view active items" ON items
  FOR SELECT
  USING (status IN ('active', 'at_security'));
