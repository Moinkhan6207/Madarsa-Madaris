import 'react-native-gesture-handler';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/services/queryClient';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineBanner from './src/components/layout/OfflineBanner';
import { useReactQueryOnlineManager } from './src/hooks/useReactQueryOnlineManager';

export default function App() {
  useReactQueryOnlineManager();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <OfflineBanner />
          <AppNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
