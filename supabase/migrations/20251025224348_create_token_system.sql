/*
  # Token Economy System

  1. New Tables
    - `token_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `amount` (integer) - positive for earning, negative for spending
      - `transaction_type` (text) - 'earned', 'spent', 'purchased', 'refund'
      - `reason` (text)
      - `reference_id` (uuid) - optional reference to related entity
      - `reference_type` (text) - 'meditation', 'course', 'achievement'
      - `balance_after` (integer)
      - `created_at` (timestamptz)

    - `token_packages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `token_amount` (integer)
      - `price_usd` (decimal)
      - `bonus_tokens` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only view their own transactions
    - Token packages are viewable by all
*/

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'purchased', 'refund', 'bonus')),
  reason text,
  reference_id uuid,
  reference_type text CHECK (reference_type IN ('meditation', 'course', 'achievement', 'daily_reward', 'streak_bonus', 'purchase')),
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create token_packages table
CREATE TABLE IF NOT EXISTS token_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  token_amount integer NOT NULL,
  price_usd decimal(10, 2) NOT NULL,
  bonus_tokens integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for token_transactions
CREATE POLICY "Users can view their own transactions"
  ON token_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions"
  ON token_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for token_packages
CREATE POLICY "Anyone can view token packages"
  ON token_packages FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage token packages"
  ON token_packages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to handle token transaction
CREATE OR REPLACE FUNCTION public.process_token_transaction()
RETURNS trigger AS $$
BEGIN
  -- Update user's token balance
  UPDATE profiles
  SET token_balance = NEW.balance_after
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update token balance
DROP TRIGGER IF EXISTS on_token_transaction_created ON token_transactions;
CREATE TRIGGER on_token_transaction_created
  AFTER INSERT ON token_transactions
  FOR EACH ROW EXECUTE FUNCTION public.process_token_transaction();