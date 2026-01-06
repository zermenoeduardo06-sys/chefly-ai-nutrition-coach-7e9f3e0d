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
        
        // Configure RevenueCat with API key
        const REVENUECAT_API_KEY = 'test_CtWOrFkddqCwPBewEJZDzInhOWy';
        
        await Purchases.configure({
          apiKey: REVENUECAT_API_KEY,
          appUserID: userId || undefined,
        });
        console.log('[IAP] RevenueCat configured successfully');

        // If user is logged in, login to RevenueCat
        if (userId) {
          await Purchases.logIn({ appUserID: userId });
          console.log('[IAP] User logged in to RevenueCat:', userId);
        }

        // Fetch offerings to get actual product info
        const offerings = await Purchases.getOfferings();
        const products: IAPProduct[] = [];

        if (offerings?.current?.availablePackages) {
          for (const pkg of offerings.current.availablePackages) {
            products.push({
              id: pkg.product.identifier,
              title: pkg.product.title,
              description: pkg.product.description,
              price: pkg.product.priceString,
              priceAsDecimal: pkg.product.price,
              currency: pkg.product.currencyCode,
            });
          }
        }

        // Fallback products if offerings aren't configured yet
        if (products.length === 0) {
          products.push(
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
            }
          );
        }

        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isAvailable: true,
          products,
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
  }, [isNativeIOS, userId]);

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
      console.log('[IAP] Offerings:', JSON.stringify(offerings));
      
      const currentOffering = offerings?.current;
      
      if (!currentOffering || !currentOffering.availablePackages?.length) {
        console.log('[IAP] No offerings available, attempting direct product purchase');
        
        // Try to get products directly
        const { products } = await Purchases.getProducts({ 
          productIdentifiers: [productId] 
        });
        
        console.log('[IAP] Direct products:', JSON.stringify(products));
        
        if (products && products.length > 0) {
          const { customerInfo } = await Purchases.purchaseStoreProduct({ 
            product: products[0] 
          });
          
          console.log('[IAP] Purchase successful via direct product');
          console.log('[IAP] Customer info:', JSON.stringify(customerInfo));
          
          // Verify the purchase was successful
          const isActive = Object.keys(customerInfo.entitlements.active).length > 0;

          if (isActive) {
            console.log('[IAP] Updating subscription in database...');
            // Update is_subscribed directly in profiles table since this is an Apple IAP
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ is_subscribed: true })
              .eq('id', userId);
            
            if (updateError) {
              console.error('[IAP] Failed to update profile:', updateError);
            } else {
              console.log('[IAP] Profile updated successfully - user is now subscribed');
            }
            
            setState(prev => ({ ...prev, isPurchasing: false }));
            return true;
          }
        }
        
        throw new Error('No products available for purchase');
      }

      // Find the package matching our product
      const pkg = currentOffering.availablePackages.find(
        p => p.product.identifier === productId
      );

      if (!pkg) {
        console.log('[IAP] Product not found in packages, trying all packages');
        // If exact match not found, try first available package
        const firstPkg = currentOffering.availablePackages[0];
        if (firstPkg) {
          console.log('[IAP] Using first available package:', firstPkg.product.identifier);
          const { customerInfo } = await Purchases.purchasePackage({ aPackage: firstPkg });
          
          const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
          if (isActive) {
            console.log('[IAP] Updating subscription in database (first package)...');
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ is_subscribed: true })
              .eq('id', userId);
            
            if (updateError) {
              console.error('[IAP] Failed to update profile:', updateError);
            } else {
              console.log('[IAP] Profile updated successfully');
            }
            
            setState(prev => ({ ...prev, isPurchasing: false }));
            return true;
          }
        }
        throw new Error(`Product ${productId} not found in offerings`);
      }

      // Make the purchase
      console.log('[IAP] Purchasing package:', pkg.product.identifier);
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      
      // Verify the purchase was successful
      const isActive = customerInfo.entitlements.active['premium'] !== undefined ||
                       customerInfo.entitlements.active['family'] !== undefined ||
                       Object.keys(customerInfo.entitlements.active).length > 0;

      if (isActive) {
        console.log('[IAP] Purchase successful, updating database directly');
        // Update is_subscribed directly in profiles table for Apple IAP
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_subscribed: true })
          .eq('id', userId);
        
        if (updateError) {
          console.error('[IAP] Failed to update profile:', updateError);
        } else {
          console.log('[IAP] Profile updated successfully - user is now subscribed');
        }
        
        setState(prev => ({ ...prev, isPurchasing: false }));
        return true;
      }

      setState(prev => ({ ...prev, isPurchasing: false }));
      return false;
    } catch (error: any) {
      console.error('[IAP] Purchase failed:', error);
      console.error('[IAP] Error details:', JSON.stringify(error));
      
      // Check if user cancelled
      if (error.code === 'PURCHASE_CANCELLED' || 
          error.message?.includes('cancel') ||
          error.code === 1) {
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
      console.log('[IAP] Restore customer info:', JSON.stringify(customerInfo));
      
      // Check if any entitlements are active
      const hasActiveSubscription = 
        customerInfo.entitlements.active['premium'] !== undefined ||
        customerInfo.entitlements.active['family'] !== undefined ||
        Object.keys(customerInfo.entitlements.active).length > 0;

      if (hasActiveSubscription) {
        console.log('[IAP] Restore successful, updating database...');
        // Update is_subscribed directly in profiles table for Apple IAP
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_subscribed: true })
          .eq('id', userId);
        
        if (updateError) {
          console.error('[IAP] Failed to update profile on restore:', updateError);
        } else {
          console.log('[IAP] Profile updated successfully from restore');
        }
        
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
