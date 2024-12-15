-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_avatar_update ON public.users;
DROP FUNCTION IF EXISTS handle_avatar_update();

-- Create function to handle avatar updates with proper syntax
CREATE OR REPLACE FUNCTION handle_avatar_update()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update timestamp if avatar URL changed
  IF (NEW.avatar_url IS DISTINCT FROM OLD.avatar_url) THEN
    NEW.updated_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for avatar updates
CREATE TRIGGER on_avatar_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_avatar_update();