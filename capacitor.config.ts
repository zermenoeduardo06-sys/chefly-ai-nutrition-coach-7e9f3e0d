import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cheflyai.app',
  appName: 'Chefly AI',
  webDir: 'dist',
  server: {
    url: 'https://833b3131-01b5-463f-bcf8-2a92aa5adcfc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0a0a0a',
    preferredContentMode: 'mobile'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#22c55e'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#22c55e'
    }
  }
};

export default config;
