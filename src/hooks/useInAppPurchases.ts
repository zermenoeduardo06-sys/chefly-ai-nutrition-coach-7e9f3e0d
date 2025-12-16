import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Product IDs - These must match your App Store Connect configuration
export const IAP_PRODUCTS = {
  CHEFLY_PLUS_MONTHLY: 'com.cheflyai.app.chefly_plus_monthly',
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

// Placeholder hook - IAP will be implemented when Apple Developer account is ready
export const useInAppPurchases = (_userId: string | undefined) => {
  const [state] = useState<PurchaseState>({
    isAvailable: false,
    isLoading: false,
    isPurchasing: false,
    products: [],
    error: null,
    isRestoring: false,
  });

  const isNativeIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  const purchaseProduct = useCallback(async (_productId: string) => {
    console.log('IAP not implemented yet - Apple Developer account required');
    return false;
  }, []);

  const restorePurchases = useCallback(async () => {
    console.log('IAP not implemented yet - Apple Developer account required');
    return false;
  }, []);

  const purchaseCheflyPlus = useCallback(() => {
    return purchaseProduct(IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY);
  }, [purchaseProduct]);

  return {
    ...state,
    isNativeIOS,
    purchaseProduct,
    purchaseCheflyPlus,
    restorePurchases,
    clearError: () => {},
  };
};
