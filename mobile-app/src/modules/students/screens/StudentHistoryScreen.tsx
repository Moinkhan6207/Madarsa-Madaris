import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { useStudentHistory } from '@/modules/students/hooks';
import { HistoryItem } from '@/modules/students/components/HistoryItem';
import type { StudentsStackParamList } from '@/navigation/types';

type RouteProps = RouteProp<StudentsStackParamList, 'StudentHistory'>;
type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

export default function StudentHistoryScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { studentId } = route.params;

  const { data, isLoading, refetch } = useStudentHistory(studentId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color={colors.slate700} /></TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text><View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refetch()} tintColor={colors.primary600} />}>
        {data?.length === 0 && <Text style={styles.emptyText}>No history records.</Text>}
        {(data ?? []).map((item, i, arr) => (
          <HistoryItem key={item.id} item={item} isLast={i === arr.length - 1} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing['4'], paddingVertical: spacing['3'] },
  backBtn: { width: 40, height: 40, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.slate200, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.heading, color: colors.slate900, flex: 1, textAlign: 'center', marginHorizontal: spacing['2'] },
  scroll: { paddingHorizontal: spacing['4'], paddingVertical: spacing['4'], paddingBottom: spacing['10'] },
  emptyText: { ...typography.small, color: colors.slate400, textAlign: 'center', paddingVertical: spacing['8'] },
});
