import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '@/screens/app/DashboardScreen';
import WebsiteBuilderScreen from '@/screens/app/WebsiteBuilderScreen';
import LeadsScreen from '@/screens/app/LeadsScreen';
import SettingsScreen from '@/screens/app/SettingsScreen';
import { AppTabParamList } from '@/navigation/types';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

const iconMap: Record<keyof AppTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid-outline',
  Builder: 'globe-outline',
  Leads: 'people-outline',
  Settings: 'settings-outline',
};

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary600,
        tabBarInactiveTintColor: colors.slate400,
        tabBarStyle: { height: 68, paddingTop: 8, paddingBottom: 8, backgroundColor: colors.white, borderTopColor: colors.slate200 },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 12 },
        tabBarIcon: ({ color, size }) => <Ionicons name={iconMap[route.name as keyof AppTabParamList]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Builder" component={WebsiteBuilderScreen} options={{ title: 'Website' }} />
      <Tab.Screen name="Leads" component={LeadsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
