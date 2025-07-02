import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9142507d4b1f4f46bca716102ac6aa30',
  appName: 'ascrm',
  webDir: 'dist',
  server: {
    url: 'https://9142507d-4b1f-4f46-bca7-16102ac6aa30.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#ffffff'
    }
  }
};

export default config;