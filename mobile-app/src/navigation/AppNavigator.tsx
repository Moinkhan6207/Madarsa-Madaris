import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Loader from '@/components/ui/Loader';
import AuthNavigator from '@/navigation/AuthNavigator';
import AppTabs from '@/navigation/AppTabs';
import PlatformAdminNavigator from '@/navigation/PlatformAdminNavigator';
import SetupNavigator from '@/navigation/SetupNavigator';
import PendingNavigator from '@/navigation/PendingNavigator';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { useAuthStore } from '@/store/authStore';
import { TenantStatus } from '@/types/tenant';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8fafc',
  },
};

export default function AppNavigator() {
  useAuthBootstrap();
  const hydrated = useAuthStore((state) => state.hydrated);
  const isLoadingTenant = useAuthStore((state) => state.isLoadingTenant);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const tenant = useAuthStore((state) => state.tenant);

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');
  const effectiveStatus = tenant?.status ?? user?.tenantStatus;

  if (!hydrated || (token && isLoadingTenant && !effectiveStatus)) return <Loader />;

  return (
    <NavigationContainer theme={navTheme}>
      {token ? (
        isSuperAdmin ? (
          <PlatformAdminNavigator />
        ) : effectiveStatus === TenantStatus.DRAFT ? (
          <SetupNavigator />
        ) : effectiveStatus === TenantStatus.PENDING_ACTIVATION ? (
          <PendingNavigator />
        ) : effectiveStatus === TenantStatus.ACTIVE ? (
          <AppTabs />
        ) : (
          <AuthNavigator />
        )
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
