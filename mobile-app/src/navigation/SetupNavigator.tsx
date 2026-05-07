import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SetupLandingScreen from '@/screens/setup/SetupLandingScreen';
import ProfileSetupScreen from '@/screens/setup/ProfileSetupScreen';
import BrandingSetupScreen from '@/screens/setup/BrandingSetupScreen';
import BranchesSetupScreen from '@/screens/setup/BranchesSetupScreen';
import SessionSetupScreen from '@/screens/setup/SessionSetupScreen';
import ReviewSetupScreen from '@/screens/setup/ReviewSetupScreen';
import { SetupStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<SetupStackParamList>();

export default function SetupNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="SetupLanding">
      <Stack.Screen name="SetupLanding" component={SetupLandingScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="BrandingSetup" component={BrandingSetupScreen} />
      <Stack.Screen name="BranchesSetup" component={BranchesSetupScreen} />
      <Stack.Screen name="SessionSetup" component={SessionSetupScreen} />
      <Stack.Screen name="ReviewSetup" component={ReviewSetupScreen} />
    </Stack.Navigator>
  );
}
