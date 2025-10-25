-- Create user_tokens table to track token balances
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_tokens UNIQUE(user_id)
);

-- Create token_transactions table for transaction history
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund', 'reward')),
  description TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_purchases table (to track what content users have purchased)
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('course', 'meditation')),
  entity_id UUID NOT NULL,
  token_cost INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_purchase UNIQUE(user_id, entity_type, entity_id)
);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tokens
CREATE POLICY "Users can view their own token balance"
  ON public.user_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own token balance"
  ON public.user_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own token balance"
  ON public.user_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all tokens"
  ON public.user_tokens FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for token_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.token_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.token_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all transactions"
  ON public.token_transactions FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.user_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
  ON public.user_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all purchases"
  ON public.user_purchases FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Add trigger for updated_at on user_tokens
DROP TRIGGER IF EXISTS update_user_tokens_updated_at ON public.user_tokens;
CREATE TRIGGER update_user_tokens_updated_at
  BEFORE UPDATE ON public.user_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle token purchase (dummy payment)
CREATE OR REPLACE FUNCTION public.process_token_purchase(
  _user_id UUID,
  _amount INTEGER,
  _payment_method TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  INSERT INTO user_tokens (user_id, balance)
  VALUES (_user_id, _amount)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    balance = user_tokens.balance + _amount,
    updated_at = now()
  RETURNING balance INTO v_new_balance;

  INSERT INTO token_transactions (user_id, amount, transaction_type, description)
  VALUES (_user_id, _amount, 'purchase', 'Token purchase via ' || _payment_method)
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'transaction_id', v_transaction_id
  );
END;
$$;

-- Function to spend tokens
CREATE OR REPLACE FUNCTION public.spend_tokens(
  _user_id UUID,
  _amount INTEGER,
  _description TEXT,
  _entity_type TEXT DEFAULT NULL,
  _entity_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  SELECT balance INTO v_current_balance
  FROM user_tokens
  WHERE user_id = _user_id;

  IF v_current_balance IS NULL OR v_current_balance < _amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient tokens',
      'current_balance', COALESCE(v_current_balance, 0)
    );
  END IF;

  UPDATE user_tokens
  SET balance = balance - _amount,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING balance INTO v_new_balance;

  INSERT INTO token_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description,
    related_entity_type,
    related_entity_id
  )
  VALUES (
    _user_id, 
    -_amount, 
    'spend', 
    _description,
    _entity_type,
    _entity_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance
  );
END;
$$;

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

  SELECT spend_tokens(_user_id, _token_cost, 'Purchased ' || _entity_type, _entity_type, _entity_id)
  INTO v_result;

  IF NOT (v_result->>'success')::boolean THEN
    RETURN v_result;
  END IF;

  INSERT INTO user_purchases (user_id, entity_type, entity_id, token_cost)
  VALUES (_user_id, _entity_type, _entity_id, _token_cost);

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', (v_result->>'new_balance')::integer
  );
END;
$$;