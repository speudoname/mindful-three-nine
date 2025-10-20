import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useTokens } from './useTokens';
import { toast } from 'sonner';

export const usePremiumContent = (entityType: 'course' | 'meditation', entityId: string | undefined) => {
  const { user } = useAuth();
  const { refreshBalance } = useTokens();
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    checkPurchase();
  }, [entityId, user]);

  const checkPurchase = async () => {
    if (!user || !entityId) {
      setPurchased(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .maybeSingle();

      if (error) throw error;
      setPurchased(!!data);
    } catch (error) {
      console.error('Error checking purchase:', error);
      setPurchased(false);
    } finally {
      setLoading(false);
    }
  };

  const purchaseContent = async (tokenCost: number) => {
    if (!user || !entityId) {
      toast.error('Please sign in to purchase');
      return false;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.rpc('purchase_content', {
        _user_id: user.id,
        _entity_type: entityType,
        _entity_id: entityId,
        _token_cost: tokenCost,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_balance?: number } | null;

      if (result?.success) {
        setPurchased(true);
        await refreshBalance();
        toast.success(`${entityType === 'course' ? 'Course' : 'Meditation'} unlocked!`);
        return true;
      } else {
        toast.error(result?.error || 'Purchase failed');
        return false;
      }
    } catch (error) {
      console.error('Error purchasing content:', error);
      toast.error('Failed to purchase content');
      return false;
    } finally {
      setPurchasing(false);
    }
  };

  return {
    purchased,
    loading,
    purchasing,
    purchaseContent,
    refreshPurchase: checkPurchase,
  };
};
