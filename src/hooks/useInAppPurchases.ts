import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Product IDs - These must match your App Store Connect configuration
export const IAP_PRODUCTS = {
  CHEFLY_PLUS_MONTHLY: 'com.cheflyai.app.chefly_plus_monthly',
  // Add more products as needed
  // CHEFLY_PLUS_YEARLY: 'com.cheflyai.app.chefly_plus_yearly',
};

interface IAPProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAsDecimal: number;
  currency: string;
}

interface PurchaseState {
  isAvailable: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  products: IAPProduct[];
  error: string | null;
  isRestoring: boolean;
}

export const useInAppPurchases = (userId: string | undefined) => {
  const [state, setState] = useState<PurchaseState>({
    isAvailable: false,
    isLoading: true,
    isPurchasing: false,
    products: [],
    error: null,
    isRestoring: false,
  });

  const isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  // Initialize store when component mounts
  useEffect(() => {
    if (!isNativeIOS) {
      setState(prev => ({ ...prev, isLoading: false, isAvailable: false }));
      return;
    }

    initializeStore();
  }, [isNativeIOS]);

  const initializeStore = async () => {
    try {
      // Dynamic import to avoid issues on web
      const { InAppPurchase2 } = await import('@awesome-cordova-plugins/in-app-purchase-2');
      const store = InAppPurchase2;

      if (!store) {
        throw new Error('Store not available');
      }

      // Set debug mode for development
      store.verbosity = store.DEBUG;

      // Register products
      store.register({
        id: IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY,
        type: store.PAID_SUBSCRIPTION,
      });

      // Handle product updates
      store.when(IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY).updated((product: any) => {
        if (product.loaded) {
          setState(prev => ({
            ...prev,
            products: [{
              id: product.id,
              title: product.title || 'Chefly Plus',
              description: product.description || 'Acceso completo a todas las funciones',
              price: product.price || '$15.00',
              priceAsDecimal: product.priceMicros ? product.priceMicros / 1000000 : 15,
              currency: product.currency || 'USD',
            }],
          }));
        }
      });

      // Handle approved purchases
      store.when(IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY).approved(async (product: any) => {
        console.log('Purchase approved:', product);
        
        // Verify receipt with our server
        const verified = await verifyReceipt(product.transaction?.appStoreReceipt);
        
        if (verified) {
          product.finish();
          setState(prev => ({ ...prev, isPurchasing: false }));
        } else {
          setState(prev => ({ 
            ...prev, 
            isPurchasing: false,
            error: 'No se pudo verificar la compra'
          }));
        }
      });

      // Handle purchase errors
      store.when(IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY).error((err: any) => {
        console.error('Purchase error:', err);
        setState(prev => ({ 
          ...prev, 
          isPurchasing: false,
          error: err.message || 'Error en la compra'
        }));
      });

      // Handle cancelled purchases
      store.when(IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY).cancelled(() => {
        setState(prev => ({ ...prev, isPurchasing: false }));
      });

      // Refresh the store
      store.refresh();

      setState(prev => ({ ...prev, isAvailable: true, isLoading: false }));
    } catch (error: any) {
      console.error('Failed to initialize IAP store:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isAvailable: false,
        error: error.message 
      }));
    }
  };

  const verifyReceipt = async (receipt: string): Promise<boolean> => {
    if (!userId || !receipt) return false;

    try {
      const { data, error } = await supabase.functions.invoke('verify-apple-receipt', {
        body: { 
          receipt,
          userId,
          productId: IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY,
        },
      });

      if (error) throw error;
      return data?.valid === true;
    } catch (error) {
      console.error('Receipt verification failed:', error);
      return false;
    }
  };

  const purchaseProduct = useCallback(async (productId: string) => {
    if (!isNativeIOS) {
      setState(prev => ({ ...prev, error: 'IAP solo disponible en iOS' }));
      return false;
    }

    setState(prev => ({ ...prev, isPurchasing: true, error: null }));

    try {
      const { InAppPurchase2 } = await import('@awesome-cordova-plugins/in-app-purchase-2');
      const store = InAppPurchase2;
      
      store.order(productId);
      return true;
    } catch (error: any) {
      console.error('Purchase failed:', error);
      setState(prev => ({ 
        ...prev, 
        isPurchasing: false,
        error: error.message || 'Error al iniciar la compra'
      }));
      return false;
    }
  }, [isNativeIOS]);

  const restorePurchases = useCallback(async () => {
    if (!isNativeIOS) return false;

    setState(prev => ({ ...prev, isRestoring: true, error: null }));

    try {
      const { InAppPurchase2 } = await import('@awesome-cordova-plugins/in-app-purchase-2');
      const store = InAppPurchase2;
      
      store.refresh();
      
      // Give it a moment to restore
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setState(prev => ({ ...prev, isRestoring: false }));
      return true;
    } catch (error: any) {
      console.error('Restore failed:', error);
      setState(prev => ({ 
        ...prev, 
        isRestoring: false,
        error: error.message || 'Error al restaurar compras'
      }));
      return false;
    }
  }, [isNativeIOS]);

  const purchaseCheflyPlus = useCallback(() => {
    return purchaseProduct(IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY);
  }, [purchaseProduct]);

  return {
    ...state,
    isNativeIOS,
    purchaseProduct,
    purchaseCheflyPlus,
    restorePurchases,
    clearError: () => setState(prev => ({ ...prev, error: null })),
  };
};
