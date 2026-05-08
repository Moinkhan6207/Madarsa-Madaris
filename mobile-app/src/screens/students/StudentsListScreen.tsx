import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Header from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { studentService } from '@/features/students/service';
import { StudentCard } from '@/features/students/components/StudentCard';
import type { Student, StudentStatus, StudentListFilters } from '@/features/students/types';
import { STATUS_DISPLAY } from '@/features/students/types';
import type { StudentsStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

const statusFilters: { label: string; value: StudentStatus | 'all'; color: string }[] = [
  { label: 'All', value: 'all', color: colors.slate500 },
  { label: 'Lead', value: 'LEAD', color: colors.slate600 },
  { label: 'Applied', value: 'APPLIED', color: colors.blue500 },
  { label: 'Review', value: 'UNDER_REVIEW', color: colors.amber500 },
  { label: 'Admitted', value: 'ADMITTED', color: colors.purple500 },
  { label: 'Active', value: 'ACTIVE', color: colors.primary600 },
  { label: 'Dropped', value: 'DROPPED', color: colors.red500 },
  { label: 'Alumni', value: 'ALUMNI', color: colors.slate500 },
];

export default function StudentsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const filters: StudentListFilters = {
    page,
    limit: 20,
    search: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      const res = await studentService.list(filters);
      return res.data;
    },
  });

  const handleStudentPress = useCallback((student: Student) => {
    navigation.navigate('StudentDetail', { studentId: student.id });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Student }) => (
    <StudentCard student={item} onPress={handleStudentPress} />
  ), [handleStudentPress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Students" subtitle="Manage student records" />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.slate400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, admission #, phone..."
          value={search}
          onChangeText={(text) => { setSearch(text); setPage(1); }}
          placeholderTextColor={colors.slate400}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); setPage(1); }}>
            <Ionicons name="close-circle" size={18} color={colors.slate400} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={statusFilters}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              statusFilter === item.value && { backgroundColor: item.color + '15', borderColor: item.color },
            ]}
            onPress={() => { setStatusFilter(item.value); setPage(1); }}
          >
            <Text style={[
              styles.filterChipText,
              statusFilter === item.value && { color: item.color, fontWeight: '800' },
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Content */}
      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} padding="lg" style={styles.skeletonCard}>
              <View style={styles.skeletonRow}>
                <Skeleton circle width={48} height={48} />
                <View style={styles.skeletonInfo}>
                  <Skeleton width={160} height={14} />
                  <Skeleton width={100} height={10} style={{ marginTop: spacing['2'] }} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <FlatList
          data={data?.students ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor={colors.primary600} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.slate300} />
              <Text style={styles.emptyTitle}>No students found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters or add a new student.</Text>
            </View>
          }
          ListFooterComponent={
            data && data.totalPages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  disabled={page <= 1}
                  style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Ionicons name="chevron-back" size={16} color={page <= 1 ? colors.slate300 : colors.slate600} />
                </TouchableOpacity>
                <Text style={styles.pageText}>Page {data.page} of {data.totalPages}</Text>
                <TouchableOpacity
                  disabled={page >= data.totalPages}
                  style={[styles.pageBtn, page >= data.totalPages && styles.pageBtnDisabled]}
                  onPress={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                >
                  <Ionicons name="chevron-forward" size={16} color={page >= data.totalPages ? colors.slate300 : colors.slate600} />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('StudentCreate')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing['4'],
    marginTop: spacing['3'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.slate200,
    gap: spacing['2'],
  },
  searchInput: {
    flex: 1,
    ...typography.small,
    color: colors.slate800,
    paddingVertical: 0,
  },
  filterList: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    gap: spacing['2'],
  },
  filterChip: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1.5'],
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginRight: spacing['2'],
  },
  filterChipText: {
    ...typography.xs,
    color: colors.slate600,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['20'],
    gap: spacing['3'],
  },
  skeletonCard: {
    marginBottom: spacing['3'],
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  skeletonInfo: {
    flex: 1,
    gap: spacing['1'],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['16'],
    gap: spacing['3'],
  },
  emptyTitle: {
    ...typography.heading,
    color: colors.slate600,
    marginTop: spacing['2'],
  },
  emptySub: {
    ...typography.small,
    color: colors.slate400,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['4'],
    paddingVertical: spacing['6'],
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnDisabled: {
    backgroundColor: colors.slate100,
    borderColor: colors.slate100,
  },
  pageText: {
    ...typography.smallBold,
    color: colors.slate600,
  },
  fab: {
    position: 'absolute',
    right: spacing['5'],
    bottom: spacing['6'],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primary,
  },
});
