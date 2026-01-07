import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.833b313101b5463fbcf82a92aa5adcfc',
  appName: 'Chefly AI',
  webDir: 'dist',
  // Para desarrollo con hot-reload, descomenta el bloque server:
  // server: {
  //   url: 'https://833b3131-01b5-463f-bcf8-2a92aa5adcfc.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#12161f', // Must match --background in dark mode: hsl(220 25% 10%)
    preferredContentMode: 'mobile',
    scrollEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#12161f',
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
