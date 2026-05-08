import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Card from '@/components/ui/Card';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { useStudent, useDeleteStudent, useChangeStudentStatus } from '@/features/students/hooks';
import { StatusBadge } from '@/features/students/components/StatusBadge';
import { GuardianCard } from '@/features/students/components/GuardianCard';
import { SponsorCard } from '@/features/students/components/SponsorCard';
import { HistoryItem } from '@/features/students/components/HistoryItem';
import { canTransition, type StudentStatus } from '@/features/students/types';
import type { StudentsStackParamList } from '@/navigation/types';

type RouteProps = RouteProp<StudentsStackParamList, 'StudentDetail'>;
type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

export default function StudentDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { studentId } = route.params;

  const { data: student, isLoading, refetch } = useStudent(studentId);
  const deleteMutation = useDeleteStudent();
  const statusMutation = useChangeStudentStatus(studentId);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | null>(null);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Student?',
      'This will soft-delete the student record. Data remains in the system but is hidden from most views.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMutation.mutateAsync(studentId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [deleteMutation, studentId, navigation]);

  const handleStatusChange = useCallback(async () => {
    if (!selectedStatus || !student) return;
    if (!canTransition(student.status, selectedStatus)) {
      Alert.alert('Invalid Transition', `Cannot transition from ${student.status} to ${selectedStatus}`);
      return;
    }
    await statusMutation.mutateAsync({ status: selectedStatus });
    setStatusModalVisible(false);
    setSelectedStatus(null);
  }, [selectedStatus, student, statusMutation]);

  if (isLoading || !student) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const allowedTransitions = student ? (() => {
    const { getAllowedTransitions } = require('@/features/students/types');
    return getAllowedTransitions(student.status);
  })() : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.slate700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{student.fullName}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={colors.red500} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary600} />}
      >
        {/* Profile Card */}
        <Card padding="lg" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{student.fullName?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{student.fullName}</Text>
              <Text style={styles.profileMeta}>{student.admissionNumber}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={student.status} />
                {student.isOrphan && (
                  <View style={[styles.miniBadge, { backgroundColor: colors.amber50 }]}>
                    <Text style={[styles.miniBadgeText, { color: colors.amber600 }]}>Orphan</Text>
                  </View>
                )}
                {student.isNeedy && (
                  <View style={[styles.miniBadge, { backgroundColor: colors.blue50 }]}>
                    <Text style={[styles.miniBadgeText, { color: colors.blue600 }]}>Needy</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('StudentEdit', { studentId })}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary600} />
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setStatusModalVisible(true)}
          >
            <Ionicons name="git-compare-outline" size={20} color={colors.primary600} />
            <Text style={styles.actionBtnText}>Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('GuardianManage', { studentId })}
          >
            <Ionicons name="people-outline" size={20} color={colors.primary600} />
            <Text style={styles.actionBtnText}>Guardians</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('SponsorManage', { studentId })}
          >
            <Ionicons name="briefcase-outline" size={20} color={colors.primary600} />
            <Text style={styles.actionBtnText}>Sponsors</Text>
          </TouchableOpacity>
        </View>

        {/* Info Grid */}
        <Card padding="lg" style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoGrid}>
            {student.branch?.name && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={16} color={colors.slate400} />
                <Text style={styles.infoLabel}>Branch</Text>
                <Text style={styles.infoValue}>{student.branch.name}</Text>
              </View>
            )}
            {student.phone && (
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={16} color={colors.slate400} />
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{student.phone}</Text>
              </View>
            )}
            {student.email && (
              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={16} color={colors.slate400} />
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{student.email}</Text>
              </View>
            )}
            {student.currentProgram && (
              <View style={styles.infoItem}>
                <Ionicons name="school-outline" size={16} color={colors.slate400} />
                <Text style={styles.infoLabel}>Program</Text>
                <Text style={styles.infoValue}>{student.currentProgram}</Text>
              </View>
            )}
            {student.currentClass && (
              <View style={styles.infoItem}>
                <Ionicons name="layers-outline" size={16} color={colors.slate400} />
                <Text style={styles.infoLabel}>Class</Text>
                <Text style={styles.infoValue}>{student.currentClass}</Text>
              </View>
            )}
            {student.dateOfBirth && (
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.slate400} />
                <Text style={styles.infoLabel}>DOB</Text>
                <Text style={styles.infoValue}>{new Date(student.dateOfBirth).toLocaleDateString('en-IN')}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Guardians */}
        <Card padding="lg" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Guardians ({student.guardians?.filter(g => !g.deletedAt).length ?? 0})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GuardianManage', { studentId })}>
              <Text style={styles.sectionAction}>Manage</Text>
            </TouchableOpacity>
          </View>
          {student.guardians?.filter(g => !g.deletedAt).map((g) => (
            <GuardianCard key={g.id} guardian={g} />
          ))}
          {(student.guardians?.filter(g => !g.deletedAt).length ?? 0) === 0 && (
            <Text style={styles.emptyText}>No guardians added.</Text>
          )}
        </Card>

        {/* Sponsors */}
        <Card padding="lg" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sponsors ({student.sponsors?.filter(s => !s.deletedAt).length ?? 0})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SponsorManage', { studentId })}>
              <Text style={styles.sectionAction}>Manage</Text>
            </TouchableOpacity>
          </View>
          {student.sponsors?.filter(s => !s.deletedAt).map((s) => (
            <SponsorCard key={s.id} mapping={s} />
          ))}
          {(student.sponsors?.filter(s => !s.deletedAt).length ?? 0) === 0 && (
            <Text style={styles.emptyText}>No sponsors linked.</Text>
          )}
        </Card>

        {/* History */}
        <Card padding="lg" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>History</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StudentHistory', { studentId })}>
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>
          {(student.history?.slice(0, 5) ?? []).map((h, i, arr) => (
            <HistoryItem key={h.id} item={h} isLast={i === arr.length - 1} />
          ))}
          {(student.history?.length ?? 0) === 0 && (
            <Text style={styles.emptyText}>No history records.</Text>
          )}
        </Card>
      </ScrollView>

      {/* Status Modal */}
      {statusModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Change Status</Text>
            <Text style={styles.modalCurrent}>Current: <Text style={styles.modalCurrentValue}>{student.status}</Text></Text>
            <ScrollView style={styles.modalList}>
              {allowedTransitions.length === 0 ? (
                <Text style={styles.modalEmpty}>No transitions available.</Text>
              ) : (
                allowedTransitions.map((s: StudentStatus) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.modalItem, selectedStatus === s && styles.modalItemActive]}
                    onPress={() => setSelectedStatus(s)}
                  >
                    <StatusBadge status={s} />
                    {selectedStatus === s && (
                      <Ionicons name="checkmark" size={18} color={colors.primary600} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setStatusModalVisible(false); setSelectedStatus(null); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, !selectedStatus && styles.modalConfirmDisabled]}
                disabled={!selectedStatus}
                onPress={handleStatusChange}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.slate400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.heading,
    color: colors.slate900,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing['2'],
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: colors.red50,
    borderWidth: 1,
    borderColor: colors.red100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['10'],
    gap: spacing['4'],
  },
  profileCard: {
    marginTop: spacing['2'],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius['2xl'],
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h2,
    color: colors.primary600,
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    ...typography.heading,
    color: colors.slate900,
  },
  profileMeta: {
    ...typography.small,
    color: colors.slate400,
    marginTop: spacing['0.5'],
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  miniBadge: {
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['0.5'],
    borderRadius: radius.pill,
  },
  miniBadgeText: {
    ...typography.xs,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.slate100,
    paddingVertical: spacing['3'],
    ...shadows.xs,
  },
  actionBtn: {
    alignItems: 'center',
    gap: spacing['1'],
  },
  actionBtnText: {
    ...typography.xsBold,
    color: colors.slate600,
  },
  infoCard: {
    ...shadows.xs,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing['3'],
    gap: spacing['3'],
  },
  infoItem: {
    width: '47%',
    backgroundColor: colors.slate50,
    borderRadius: radius.xl,
    padding: spacing['3'],
    gap: spacing['1'],
  },
  infoLabel: {
    ...typography.xs,
    color: colors.slate400,
  },
  infoValue: {
    ...typography.smallBold,
    color: colors.slate800,
  },
  sectionCard: {
    ...shadows.xs,
    gap: spacing['3'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.slate900,
  },
  sectionAction: {
    ...typography.smallBold,
    color: colors.primary600,
  },
  emptyText: {
    ...typography.small,
    color: colors.slate400,
    textAlign: 'center',
    paddingVertical: spacing['4'],
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['6'],
    zIndex: 100,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: radius['3xl'],
    padding: spacing['6'],
    width: '100%',
    maxHeight: '80%',
    ...shadows.xl,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.slate900,
    fontSize: 20,
  },
  modalCurrent: {
    ...typography.small,
    color: colors.slate500,
    marginTop: spacing['1'],
  },
  modalCurrentValue: {
    ...typography.smallBold,
    color: colors.slate700,
  },
  modalList: {
    marginTop: spacing['4'],
    marginBottom: spacing['4'],
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing['3'],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate100,
    marginBottom: spacing['2'],
  },
  modalItemActive: {
    borderColor: colors.primary300,
    backgroundColor: colors.primary50,
  },
  modalEmpty: {
    ...typography.small,
    color: colors.slate400,
    textAlign: 'center',
    paddingVertical: spacing['4'],
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  modalCancel: {
    flex: 1,
    paddingVertical: spacing['3'],
    borderRadius: radius.xl,
    backgroundColor: colors.slate100,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.smallBold,
    color: colors.slate600,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: spacing['3'],
    borderRadius: radius.xl,
    backgroundColor: colors.primary600,
    alignItems: 'center',
  },
  modalConfirmDisabled: {
    backgroundColor: colors.slate200,
  },
  modalConfirmText: {
    ...typography.smallBold,
    color: colors.white,
  },
});
