-- Add token_cost to courses table
ALTER TABLE public.courses 
ADD COLUMN token_cost INTEGER NOT NULL DEFAULT 0;

-- Add token_cost to standalone_meditations table
ALTER TABLE public.standalone_meditations 
ADD COLUMN token_cost INTEGER NOT NULL DEFAULT 0;

-- Create table for user purchases (to track what content users have purchased)
CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('course', 'meditation')),
  entity_id UUID NOT NULL,
  token_cost INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_purchase UNIQUE(user_id, entity_type, entity_id)
);

-- Enable RLS
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.user_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
  ON public.user_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all purchases"
  ON public.user_purchases FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Function to purchase premium content
CREATE OR REPLACE FUNCTION public.purchase_content(
  _user_id UUID,
  _entity_type TEXT,
  _entity_id UUID,
  _token_cost INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check if already purchased
  IF EXISTS (
    SELECT 1 FROM user_purchases 
    WHERE user_id = _user_id 
    AND entity_type = _entity_type 
    AND entity_id = _entity_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Content already purchased'
    );
  END IF;

  -- Spend tokens
  SELECT spend_tokens(_user_id, _token_cost, 'Purchased ' || _entity_type, _entity_type, _entity_id)
  INTO v_result;

  IF NOT (v_result->>'success')::boolean THEN
    RETURN v_result;
  END IF;

  -- Record purchase
  INSERT INTO user_purchases (user_id, entity_type, entity_id, token_cost)
  VALUES (_user_id, _entity_type, _entity_id, _token_cost);

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', (v_result->>'new_balance')::integer
  );
END;
$$;