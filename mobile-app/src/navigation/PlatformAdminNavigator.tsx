import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlatformAdminStackParamList } from '@/navigation/types';
import PlatformAdminTabs from '@/navigation/PlatformAdminTabs';

const Stack = createNativeStackNavigator<PlatformAdminStackParamList>();

export default function PlatformAdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlatformAdminTabs" component={PlatformAdminTabs} />
    </Stack.Navigator>
  );
}
