import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentsListScreen from '@/modules/students/screens/StudentsListScreen';
import StudentDetailScreen from '@/modules/students/screens/StudentDetailScreen';
import StudentCreateScreen from '@/modules/students/screens/StudentCreateScreen';
import StudentEditScreen from '@/modules/students/screens/StudentEditScreen';
import GuardianManageScreen from '@/modules/students/screens/GuardianManageScreen';
import SponsorManageScreen from '@/modules/students/screens/SponsorManageScreen';
import StudentHistoryScreen from '@/modules/students/screens/StudentHistoryScreen';
import StudentDocumentsScreen from '@/modules/students/screens/StudentDocumentsScreen';
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
      <Stack.Screen name="StudentDocuments" component={StudentDocumentsScreen} />
    </Stack.Navigator>
  );
}
