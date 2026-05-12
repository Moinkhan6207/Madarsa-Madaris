import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Header from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { studentService } from '@/modules/students/services';
import { StudentCard } from '@/modules/students/components/StudentCard';
import DashboardStats from '@/modules/students/components/DashboardStats';
import StudentFilters from '@/modules/students/components/StudentFilters';
import { useBranches } from '@/modules/students/utils/reference';
import type { Student, StudentListFilters } from '@/modules/students/types';
import type { StudentsStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

export default function StudentsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [filters, setFilters] = useState<StudentListFilters>({
    page: 1,
    limit: 20,
    search: undefined,
  });
  
  // Local state for search to debounce
  const [searchInput, setSearchInput] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput.trim() || undefined, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: branches = [] } = useBranches();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      const res = await studentService.list(filters);
      return res.data;
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleStudentPress = useCallback((student: Student) => {
    navigation.navigate('StudentDetail', { studentId: student.id });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Student }) => (
    <View style={styles.itemWrapper}>
      <StudentCard student={item} onPress={handleStudentPress} />
    </View>
  ), [handleStudentPress]);

  const activeCount = data?.students?.filter(s => s.status === 'ACTIVE').length || 0;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <DashboardStats 
        total={data?.total || '-'}
        active={activeCount}
        pages={data?.totalPages || '-'}
        currentPage={data?.page || '-'}
      />
    </View>
  );

  const renderStickyFilters = () => (
    <View style={styles.stickyHeader}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.slate400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name, admission #, phone..."
          value={searchInput}
          onChangeText={setSearchInput}
          placeholderTextColor={colors.slate400}
        />
        {searchInput.length > 0 && (
          <TouchableOpacity onPress={() => setSearchInput('')}>
            <Ionicons name="close-circle" size={18} color={colors.slate400} />
          </TouchableOpacity>
        )}
      </View>

      <StudentFilters 
        filters={filters} 
        onChange={setFilters} 
        branches={branches} 
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Students" subtitle="Manage student records" />
      
      {renderStickyFilters()}

      {isLoading ? (
        <View style={styles.list}>
          {renderHeader()}
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.itemWrapper}>
              <Card padding="lg" style={styles.skeletonCard}>
                <View style={styles.skeletonRow}>
                  <Skeleton circle width={48} height={48} />
                  <View style={styles.skeletonInfo}>
                    <Skeleton width={160} height={14} />
                    <Skeleton width={100} height={10} style={{ marginTop: spacing['2'] }} />
                  </View>
                </View>
              </Card>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={data?.students ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor={colors.primary600} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.slate300} />
              <Text style={styles.emptyTitle}>No students found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters or add a new student.</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => refetch()}
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            data && data.totalPages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  disabled={(filters.page || 1) <= 1}
                  style={[styles.pageBtn, (filters.page || 1) <= 1 && styles.pageBtnDisabled]}
                  onPress={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                >
                  <Ionicons name="chevron-back" size={16} color={(filters.page || 1) <= 1 ? colors.slate300 : colors.slate600} />
                </TouchableOpacity>
                <Text style={styles.pageText}>Page {data.page} of {data.totalPages}</Text>
                <TouchableOpacity
                  disabled={(filters.page || 1) >= data.totalPages}
                  style={[styles.pageBtn, (filters.page || 1) >= data.totalPages && styles.pageBtnDisabled]}
                  onPress={() => setFilters(f => ({ ...f, page: Math.min(data.totalPages, (f.page || 1) + 1) }))}
                >
                  <Ionicons name="chevron-forward" size={16} color={(filters.page || 1) >= data.totalPages ? colors.slate300 : colors.slate600} />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

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
  headerContainer: {
    paddingTop: spacing['3'],
  },
  stickyHeader: {
    backgroundColor: colors.slate50,
    zIndex: 10,
    paddingTop: spacing['2'],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing['4'],
    marginBottom: spacing['3'],
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
  list: {
    paddingBottom: spacing['20'],
    gap: spacing['3'],
  },
  itemWrapper: {
    paddingHorizontal: spacing['4'],
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
  retryBtn: {
    marginTop: spacing['4'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    backgroundColor: colors.primary50,
    borderRadius: radius.lg,
  },
  retryBtnText: {
    ...typography.smallBold,
    color: colors.primary700,
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
