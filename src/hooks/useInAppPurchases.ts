import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Apple Product IDs - Must match App Store Connect configuration
export const APPLE_IAP_PRODUCTS = {
  CHEFLY_PLUS_MONTHLY: 'chefly_plus_monthly_',
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

// RevenueCat error codes for better diagnostics
const REVENUECAT_ERROR_CODES: Record<number, string> = {
  0: 'UnknownError',
  1: 'PurchaseCancelledError',
  2: 'StoreProblemError',
  3: 'PurchaseNotAllowedError',
  4: 'PurchaseInvalidError',
  5: 'ProductNotAvailableForPurchaseError',
  6: 'ProductAlreadyPurchasedError',
  7: 'ReceiptAlreadyInUseError',
  8: 'InvalidReceiptError',
  9: 'MissingReceiptFileError',
  10: 'NetworkError',
  11: 'InvalidCredentialsError',
  12: 'UnexpectedBackendResponseError',
  13: 'InvalidAppUserIdError',
  14: 'OperationAlreadyInProgressError',
  15: 'UnknownBackendError',
  16: 'InvalidAppleSubscriptionKeyError',
  17: 'IneligibleError',
  18: 'InsufficientPermissionsError',
  19: 'PaymentPendingError',
  20: 'InvalidSubscriberAttributesError',
  21: 'LogOutWithAnonymousUserError',
  22: 'ConfigurationError',
  23: 'UnsupportedError',
  24: 'EmptySubscriberAttributesError',
  25: 'ProductDiscountMissingIdentifierError',
  26: 'ProductDiscountMissingSubscriptionGroupIdentifierError',
  27: 'CustomerInfoError',
  28: 'SystemInfoError',
  29: 'BeginRefundRequestError',
  30: 'ProductRequestTimedOut',
  31: 'APIEndpointBlocked',
  32: 'InvalidPromotionalOfferError',
  33: 'OfflineConnectionError',
};

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
      console.log('[IAP] Not native iOS, skipping initialization');
      setState(prev => ({ ...prev, isLoading: false, isAvailable: false }));
      return;
    }

    const initializeIAP = async () => {
      console.log('[IAP] ========== INITIALIZATION START ==========');
      console.log('[IAP] Platform:', Capacitor.getPlatform());
      console.log('[IAP] UserId:', userId);
      
      try {
        // Dynamic import to avoid issues on non-iOS platforms
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        
        // Configure RevenueCat with production API key
        const REVENUECAT_API_KEY = 'appl_ZLRbvztXqFDPEUPyFaZcxnQxpEk';
        console.log('[IAP] Configuring RevenueCat with API key:', REVENUECAT_API_KEY.substring(0, 10) + '...');
        
        await Purchases.configure({
          apiKey: REVENUECAT_API_KEY,
          appUserID: userId || undefined,
        });
        console.log('[IAP] ✅ RevenueCat configured successfully');

        // If user is logged in, login to RevenueCat
        if (userId) {
          try {
            const loginResult = await Purchases.logIn({ appUserID: userId });
            console.log('[IAP] ✅ User logged in to RevenueCat:', userId);
            console.log('[IAP] Login result created:', loginResult.created);
          } catch (loginError) {
            console.warn('[IAP] ⚠️ Login warning (may be okay):', loginError);
          }
        }

        // Get customer info to check current status
        try {
          const { customerInfo } = await Purchases.getCustomerInfo();
          console.log('[IAP] Customer Info - Active Entitlements:', Object.keys(customerInfo.entitlements.active));
          console.log('[IAP] Customer Info - All Entitlements:', Object.keys(customerInfo.entitlements.all));
        } catch (infoError) {
          console.warn('[IAP] ⚠️ Could not get customer info:', infoError);
        }

        // Fetch offerings to get actual product info
        console.log('[IAP] Fetching offerings...');
        const offerings = await Purchases.getOfferings();
        console.log('[IAP] Offerings response:', JSON.stringify(offerings, null, 2));
        
        const products: IAPProduct[] = [];

        if (offerings?.current) {
          console.log('[IAP] Current offering ID:', offerings.current.identifier);
          console.log('[IAP] Available packages count:', offerings.current.availablePackages?.length || 0);
          
          if (offerings.current.availablePackages) {
            for (const pkg of offerings.current.availablePackages) {
              console.log('[IAP] Package:', pkg.identifier, '- Product:', pkg.product.identifier, '- Price:', pkg.product.priceString);
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
        } else {
          console.warn('[IAP] ⚠️ No current offering available!');
          console.log('[IAP] All offerings:', offerings?.all ? Object.keys(offerings.all) : 'none');
        }

        // Fallback products if offerings aren't configured yet
        if (products.length === 0) {
          console.log('[IAP] ⚠️ No products from offerings, using fallback');
          products.push({
            id: APPLE_IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY,
            title: 'Chefly Plus',
            description: 'Unlimited personalized nutrition',
            price: '$7.99',
            priceAsDecimal: 7.99,
            currency: 'USD',
          });
        }

        console.log('[IAP] ✅ Initialization complete. Products:', products.length);
        console.log('[IAP] ========== INITIALIZATION END ==========');

        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isAvailable: true,
          products,
        }));
      } catch (error: any) {
        console.error('[IAP] ❌ Failed to initialize:', error);
        console.error('[IAP] Error code:', error.code);
        console.error('[IAP] Error message:', error.message);
        console.error('[IAP] Error name:', REVENUECAT_ERROR_CODES[error.code] || 'Unknown');
        console.error('[IAP] Full error:', JSON.stringify(error, null, 2));
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isAvailable: false,
          error: `Init failed: ${REVENUECAT_ERROR_CODES[error.code] || error.message || 'Unknown error'}`,
        }));
      }
    };

    initializeIAP();
  }, [isNativeIOS, userId]);

  const purchaseProduct = useCallback(async (productId: string): Promise<boolean> => {
    console.log('[IAP] ========== PURCHASE START ==========');
    console.log('[IAP] Product ID:', productId);
    console.log('[IAP] User ID:', userId);
    console.log('[IAP] Is Native iOS:', isNativeIOS);
    
    if (!isNativeIOS || !userId) {
      console.log('[IAP] ❌ Not available - platform:', Capacitor.getPlatform(), 'userId:', userId);
      return false;
    }

    setState(prev => ({ ...prev, isPurchasing: true, error: null }));

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      
      // Get current customer info first
      console.log('[IAP] Getting current customer info...');
      try {
        const { customerInfo: currentInfo } = await Purchases.getCustomerInfo();
        console.log('[IAP] Current entitlements:', Object.keys(currentInfo.entitlements.active));
      } catch (e) {
        console.warn('[IAP] Could not get current customer info:', e);
      }
      
      // Get the package for this product
      console.log('[IAP] Fetching offerings for purchase...');
      const offerings = await Purchases.getOfferings();
      console.log('[IAP] Offerings available:', !!offerings?.current);
      console.log('[IAP] Current offering:', offerings?.current?.identifier);
      console.log('[IAP] Packages count:', offerings?.current?.availablePackages?.length || 0);
      
      const currentOffering = offerings?.current;
      
      if (!currentOffering || !currentOffering.availablePackages?.length) {
        console.log('[IAP] ⚠️ No offerings available, attempting direct product purchase');
        
        // Try to get products directly
        console.log('[IAP] Fetching products directly for:', productId);
        const { products } = await Purchases.getProducts({ 
          productIdentifiers: [productId] 
        });
        
        console.log('[IAP] Direct products found:', products?.length || 0);
        if (products?.length) {
          console.log('[IAP] Product details:', JSON.stringify(products[0], null, 2));
        }
        
        if (products && products.length > 0) {
          console.log('[IAP] 🛒 Initiating direct product purchase...');
          const { customerInfo } = await Purchases.purchaseStoreProduct({ 
            product: products[0] 
          });
          
          console.log('[IAP] ✅ Purchase successful via direct product');
          console.log('[IAP] New entitlements:', Object.keys(customerInfo.entitlements.active));
          
          // If we got here, purchase was successful - update database immediately
          console.log('[IAP] Updating subscription in database...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_subscribed: true })
            .eq('id', userId);
          
          if (updateError) {
            console.error('[IAP] ❌ Failed to update profile:', updateError);
          } else {
            console.log('[IAP] ✅ Profile updated successfully - user is now subscribed');
          }
          
          console.log('[IAP] ========== PURCHASE END (SUCCESS) ==========');
          setState(prev => ({ ...prev, isPurchasing: false }));
          return true;
        }
        
        throw new Error('No products available for purchase. Check App Store Connect configuration.');
      }

      // Find the package matching our product
      console.log('[IAP] Looking for package with product:', productId);
      const pkg = currentOffering.availablePackages.find(
        p => p.product.identifier === productId
      );

      if (!pkg) {
        console.log('[IAP] ⚠️ Product not found in packages. Available:');
        currentOffering.availablePackages.forEach(p => {
          console.log('[IAP]   -', p.product.identifier);
        });
        
        // If exact match not found, try first available package
        const firstPkg = currentOffering.availablePackages[0];
        if (firstPkg) {
          console.log('[IAP] 🛒 Using first available package:', firstPkg.product.identifier);
          const { customerInfo } = await Purchases.purchasePackage({ aPackage: firstPkg });
          
          console.log('[IAP] ✅ Purchase successful via first package');
          console.log('[IAP] New entitlements:', Object.keys(customerInfo.entitlements.active));
          
          // Purchase successful - update database immediately
          console.log('[IAP] Updating subscription in database (first package)...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_subscribed: true })
            .eq('id', userId);
          
          if (updateError) {
            console.error('[IAP] ❌ Failed to update profile:', updateError);
          } else {
            console.log('[IAP] ✅ Profile updated successfully');
          }
          
          console.log('[IAP] ========== PURCHASE END (SUCCESS) ==========');
          setState(prev => ({ ...prev, isPurchasing: false }));
          return true;
        }
        throw new Error(`Product ${productId} not found in offerings`);
      }

      // Make the purchase
      console.log('[IAP] 🛒 Purchasing package:', pkg.product.identifier, 'Price:', pkg.product.priceString);
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      
      // If we reach here without error, purchase was successful
      console.log('[IAP] ✅ Purchase successful');
      console.log('[IAP] New entitlements:', Object.keys(customerInfo.entitlements.active));
      
      console.log('[IAP] Updating database directly...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_subscribed: true })
        .eq('id', userId);
      
      if (updateError) {
        console.error('[IAP] ❌ Failed to update profile:', updateError);
      } else {
        console.log('[IAP] ✅ Profile updated successfully - user is now subscribed');
      }
      
      console.log('[IAP] ========== PURCHASE END (SUCCESS) ==========');
      setState(prev => ({ ...prev, isPurchasing: false }));
      return true;
    } catch (error: any) {
      console.error('[IAP] ========== PURCHASE ERROR ==========');
      console.error('[IAP] Error object:', error);
      console.error('[IAP] Error code:', error.code);
      console.error('[IAP] Error code name:', REVENUECAT_ERROR_CODES[error.code] || 'Unknown');
      console.error('[IAP] Error message:', error.message);
      console.error('[IAP] Error userCancelled:', error.userCancelled);
      console.error('[IAP] Error underlyingErrorMessage:', error.underlyingErrorMessage);
      console.error('[IAP] Full error JSON:', JSON.stringify(error, null, 2));
      
      // Check if user cancelled - RevenueCat uses code 1 for PurchaseCancelledError
      const isCancelled = 
        error.code === 1 || 
        error.code === 'PURCHASE_CANCELLED' || 
        error.userCancelled === true ||
        error.message?.toLowerCase().includes('cancel') ||
        error.message?.toLowerCase().includes('cancelled');
      
      if (isCancelled) {
        console.log('[IAP] ℹ️ User cancelled the purchase');
        console.log('[IAP] ========== PURCHASE END (CANCELLED) ==========');
        setState(prev => ({ ...prev, isPurchasing: false, error: null }));
        return false;
      }

      // Build descriptive error message
      const errorName = REVENUECAT_ERROR_CODES[error.code] || 'UnknownError';
      const errorMessage = error.underlyingErrorMessage || error.message || 'Purchase failed';
      const fullError = `${errorName}: ${errorMessage}`;
      
      console.error('[IAP] ❌ Technical error:', fullError);
      console.log('[IAP] ========== PURCHASE END (ERROR) ==========');
      
      setState(prev => ({ 
        ...prev, 
        isPurchasing: false, 
        error: fullError,
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

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    isNativeIOS,
    purchaseProduct,
    purchaseCheflyPlus,
    restorePurchases,
    clearError,
  };
};