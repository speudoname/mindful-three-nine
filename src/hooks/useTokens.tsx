import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useTokens = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setBalance(data?.balance || 0);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    // Subscribe to token balance changes
    if (user) {
      const channel = supabase
        .channel('user-tokens-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_tokens',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchBalance();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const purchaseTokens = async (amount: number, paymentMethod: string) => {
    if (!user) {
      toast.error('Please sign in to purchase tokens');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('process_token_purchase', {
        _user_id: user.id,
        _amount: amount,
        _payment_method: paymentMethod,
      });

      if (error) throw error;

      const result = data as { success: boolean; new_balance: number; transaction_id: string } | null;
      
      if (result?.success) {
        setBalance(result.new_balance);
        toast.success(`Successfully purchased ${amount} tokens!`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      toast.error('Failed to purchase tokens');
      return false;
    }
  };

  const spendTokens = async (
    amount: number,
    description: string,
    entityType?: string,
    entityId?: string
  ) => {
    if (!user) {
      toast.error('Please sign in');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('spend_tokens', {
        _user_id: user.id,
        _amount: amount,
        _description: description,
        _entity_type: entityType,
        _entity_id: entityId,
      });

      if (error) throw error;

      const result = data as { success: boolean; new_balance?: number; error?: string; current_balance?: number } | null;

      if (result?.success) {
        setBalance(result.new_balance!);
        toast.success(`Spent ${amount} tokens`);
        return true;
      } else {
        toast.error(result?.error || 'Insufficient tokens');
        return false;
      }
    } catch (error) {
      console.error('Error spending tokens:', error);
      toast.error('Failed to spend tokens');
      return false;
    }
  };

  return {
    balance,
    loading,
    purchaseTokens,
    spendTokens,
    refreshBalance: fetchBalance,
  };
};
