import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Apple Product IDs - Must match App Store Connect configuration
export const APPLE_IAP_PRODUCTS = {
  CHEFLY_PLUS_MONTHLY: 'chefly_plus_monthly',
  CHEFLY_FAMILY_MONTHLY: 'chefly_family_monthly',
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

// RevenueCat-based implementation for iOS In-App Purchases
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

  // Initialize RevenueCat when the hook mounts
  useEffect(() => {
    if (!isNativeIOS) {
      setState(prev => ({ ...prev, isLoading: false, isAvailable: false }));
      return;
    }

    const initializeIAP = async () => {
      try {
        // Dynamic import to avoid issues on non-iOS platforms
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        
        // Check if already configured
        try {
          await Purchases.getCustomerInfo();
          console.log('[IAP] RevenueCat already configured');
        } catch {
          // Need to configure - will require API key
          console.log('[IAP] RevenueCat needs configuration');
          // For now, we'll use StoreKit directly through our verify-apple-receipt function
        }

        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isAvailable: true,
          products: [
            {
              id: APPLE_IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY,
              title: 'Chefly Plus',
              description: 'Unlimited personalized nutrition',
              price: '$7.99',
              priceAsDecimal: 7.99,
              currency: 'USD',
            },
            {
              id: APPLE_IAP_PRODUCTS.CHEFLY_FAMILY_MONTHLY,
              title: 'Chefly Familiar',
              description: 'Nutrition for up to 5 family members',
              price: '$19.99',
              priceAsDecimal: 19.99,
              currency: 'USD',
            },
          ],
        }));
      } catch (error) {
        console.error('[IAP] Failed to initialize:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isAvailable: false,
          error: 'Failed to initialize In-App Purchases',
        }));
      }
    };

    initializeIAP();
  }, [isNativeIOS]);

  const purchaseProduct = useCallback(async (productId: string): Promise<boolean> => {
    if (!isNativeIOS || !userId) {
      console.log('[IAP] Not available - platform:', Capacitor.getPlatform(), 'userId:', userId);
      return false;
    }

    setState(prev => ({ ...prev, isPurchasing: true, error: null }));

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      
      // Get the package for this product
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings?.current;
      
      if (!currentOffering) {
        throw new Error('No offerings available');
      }

      // Find the package matching our product
      const pkg = currentOffering.availablePackages.find(
        p => p.product.identifier === productId
      );

      if (!pkg) {
        throw new Error(`Product ${productId} not found in offerings`);
      }

      // Make the purchase
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      
      // Verify the purchase was successful
      const isActive = customerInfo.entitlements.active['premium'] !== undefined ||
                       customerInfo.entitlements.active['family'] !== undefined;

      if (isActive) {
        // Get the receipt and verify with our backend
        const appReceipt = customerInfo.originalAppUserId;
        
        // Call our verify-apple-receipt function
        const { error } = await supabase.functions.invoke('verify-apple-receipt', {
          body: {
            receipt: appReceipt,
            userId,
            productId,
          },
        });

        if (error) {
          console.error('[IAP] Receipt verification failed:', error);
        }

        setState(prev => ({ ...prev, isPurchasing: false }));
        return true;
      }

      setState(prev => ({ ...prev, isPurchasing: false }));
      return false;
    } catch (error: any) {
      console.error('[IAP] Purchase failed:', error);
      
      // Check if user cancelled
      if (error.code === 'PURCHASE_CANCELLED') {
        setState(prev => ({ ...prev, isPurchasing: false, error: null }));
        return false;
      }

      setState(prev => ({ 
        ...prev, 
        isPurchasing: false, 
        error: error.message || 'Purchase failed',
      }));
      return false;
    }
  }, [isNativeIOS, userId]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNativeIOS || !userId) {
      console.log('[IAP] Restore not available');
      return false;
    }

    setState(prev => ({ ...prev, isRestoring: true, error: null }));

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      
      const { customerInfo } = await Purchases.restorePurchases();
      
      // Check if any entitlements are active
      const hasActiveSubscription = 
        customerInfo.entitlements.active['premium'] !== undefined ||
        customerInfo.entitlements.active['family'] !== undefined;

      if (hasActiveSubscription) {
        // Update our backend
        await supabase.functions.invoke('check-subscription');
        
        setState(prev => ({ ...prev, isRestoring: false }));
        return true;
      }

      setState(prev => ({ 
        ...prev, 
        isRestoring: false,
        error: 'No purchases to restore',
      }));
      return false;
    } catch (error: any) {
      console.error('[IAP] Restore failed:', error);
      setState(prev => ({ 
        ...prev, 
        isRestoring: false, 
        error: error.message || 'Restore failed',
      }));
      return false;
    }
  }, [isNativeIOS, userId]);

  const purchaseCheflyPlus = useCallback(() => {
    return purchaseProduct(APPLE_IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY);
  }, [purchaseProduct]);

  const purchaseCheflyFamily = useCallback(() => {
    return purchaseProduct(APPLE_IAP_PRODUCTS.CHEFLY_FAMILY_MONTHLY);
  }, [purchaseProduct]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    isNativeIOS,
    purchaseProduct,
    purchaseCheflyPlus,
    purchaseCheflyFamily,
    restorePurchases,
    clearError,
  };
};
