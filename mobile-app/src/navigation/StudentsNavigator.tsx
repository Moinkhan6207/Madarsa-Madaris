import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentsListScreen from '@/screens/students/StudentsListScreen';
import StudentDetailScreen from '@/screens/students/StudentDetailScreen';
import StudentCreateScreen from '@/screens/students/StudentCreateScreen';
import StudentEditScreen from '@/screens/students/StudentEditScreen';
import GuardianManageScreen from '@/screens/students/GuardianManageScreen';
import SponsorManageScreen from '@/screens/students/SponsorManageScreen';
import StudentHistoryScreen from '@/screens/students/StudentHistoryScreen';
import { StudentsStackParamList } from '@/navigation/types';

const Stack = createNativeStackNavigator<StudentsStackParamList>();

export default function StudentsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentsList" component={StudentsListScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="StudentCreate" component={StudentCreateScreen} />
      <Stack.Screen name="StudentEdit" component={StudentEditScreen} />
      <Stack.Screen name="GuardianManage" component={GuardianManageScreen} />
      <Stack.Screen name="SponsorManage" component={SponsorManageScreen} />
      <Stack.Screen name="StudentHistory" component={StudentHistoryScreen} />
    </Stack.Navigator>
  );
}
