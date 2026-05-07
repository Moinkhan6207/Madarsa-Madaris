import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { PlatformAdminTabParamList } from '@/navigation/types';
import TenantsScreen from '@/screens/app/TenantsScreen';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator<PlatformAdminTabParamList>();

const iconMap: Record<keyof PlatformAdminTabParamList, keyof typeof Ionicons.glyphMap> = {
  Tenants: 'shield-checkmark-outline',
};

export default function PlatformAdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary600,
        tabBarInactiveTintColor: colors.slate400,
        tabBarStyle: { height: 68, paddingTop: 8, paddingBottom: 8, backgroundColor: colors.white, borderTopColor: colors.slate200 },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 12 },
        tabBarIcon: ({ color, size }) => <Ionicons name={iconMap[route.name as keyof PlatformAdminTabParamList]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Tenants" component={TenantsScreen} options={{ title: 'Institutions' }} />
    </Tab.Navigator>
  );
}
