import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PendingApprovalScreen from '@/screens/setup/PendingApprovalScreen';
import { PendingStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<PendingStackParamList>();

export default function PendingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
    </Stack.Navigator>
  );
}
