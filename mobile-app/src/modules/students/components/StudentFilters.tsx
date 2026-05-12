import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';
import type { StudentStatus, StudentListFilters, Branch } from '../types';

interface StudentFiltersProps {
  filters: StudentListFilters;
  onChange: (filters: StudentListFilters) => void;
  branches: Branch[];
}

const STATUS_OPTIONS: { label: string; value: StudentStatus | undefined; color: string }[] = [
  { label: 'All Statuses', value: undefined, color: colors.slate500 },
  { label: 'Lead', value: 'LEAD', color: colors.slate600 },
  { label: 'Applied', value: 'APPLIED', color: colors.blue500 },
  { label: 'Under Review', value: 'UNDER_REVIEW', color: colors.amber500 },
  { label: 'Admitted', value: 'ADMITTED', color: colors.purple500 },
  { label: 'Active', value: 'ACTIVE', color: colors.primary600 },
  { label: 'Dropped', value: 'DROPPED', color: colors.red500 },
  { label: 'Alumni', value: 'ALUMNI', color: colors.slate500 },
];

export function StudentFilters({ filters, onChange, branches }: StudentFiltersProps) {
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const selectedBranch = branches.find(b => b.id === filters.branchId);
  const selectedStatus = STATUS_OPTIONS.find(s => s.value === filters.status);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Branch Filter */}
        <TouchableOpacity
          style={[styles.chip, filters.branchId && styles.chipActive]}
          onPress={() => setShowBranchModal(true)}
        >
          <Text style={[styles.chipText, filters.branchId && styles.chipTextActive]}>
            {selectedBranch?.name || 'All Branches'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={filters.branchId ? colors.primary600 : colors.slate400} />
        </TouchableOpacity>

        {/* Status Filter */}
        <TouchableOpacity
          style={[styles.chip, filters.status && styles.chipActive]}
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={[styles.chipText, filters.status && styles.chipTextActive]}>
            {selectedStatus?.label || 'All Statuses'}
          </Text>
          <Ionicons name="chevron-down" size={14} color={filters.status ? colors.primary600 : colors.slate400} />
        </TouchableOpacity>

        {/* Orphan Toggle */}
        <TouchableOpacity
          style={[styles.chip, filters.orphan && styles.chipActive]}
          onPress={() => onChange({ ...filters, orphan: filters.orphan ? undefined : true, page: 1 })}
        >
          <Text style={[styles.chipText, filters.orphan && styles.chipTextActive]}>Orphan</Text>
        </TouchableOpacity>

        {/* Sponsored Toggle */}
        <TouchableOpacity
          style={[styles.chip, filters.sponsored && styles.chipActive]}
          onPress={() => onChange({ ...filters, sponsored: filters.sponsored ? undefined : true, page: 1 })}
        >
          <Text style={[styles.chipText, filters.sponsored && styles.chipTextActive]}>Sponsored</Text>
        </TouchableOpacity>

        {/* Needy Toggle */}
        <TouchableOpacity
          style={[styles.chip, filters.needy && styles.chipActive]}
          onPress={() => onChange({ ...filters, needy: filters.needy ? undefined : true, page: 1 })}
        >
          <Text style={[styles.chipText, filters.needy && styles.chipTextActive]}>Needy</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals for selection */}
      <Modal visible={showBranchModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Branch</Text>
              <TouchableOpacity onPress={() => setShowBranchModal(false)}>
                <Ionicons name="close" size={24} color={colors.slate400} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => { onChange({ ...filters, branchId: undefined, page: 1 }); setShowBranchModal(false); }}
              >
                <Text style={[styles.modalItemText, !filters.branchId && styles.modalItemTextActive]}>All Branches</Text>
                {!filters.branchId && <Ionicons name="checkmark" size={20} color={colors.primary600} />}
              </TouchableOpacity>
              {branches.map(branch => (
                <TouchableOpacity
                  key={branch.id}
                  style={styles.modalItem}
                  onPress={() => { onChange({ ...filters, branchId: branch.id, page: 1 }); setShowBranchModal(false); }}
                >
                  <Text style={[styles.modalItemText, filters.branchId === branch.id && styles.modalItemTextActive]}>{branch.name}</Text>
                  {filters.branchId === branch.id && <Ionicons name="checkmark" size={20} color={colors.primary600} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showStatusModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color={colors.slate400} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {STATUS_OPTIONS.map(status => (
                <TouchableOpacity
                  key={status.label}
                  style={styles.modalItem}
                  onPress={() => { onChange({ ...filters, status: status.value, page: 1 }); setShowStatusModal(false); }}
                >
                  <View style={styles.statusItemRow}>
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <Text style={[styles.modalItemText, filters.status === status.value && styles.modalItemTextActive]}>{status.label}</Text>
                  </View>
                  {filters.status === status.value && <Ionicons name="checkmark" size={20} color={colors.primary600} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['3'],
    gap: spacing['2'],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginRight: spacing['2'],
  },
  chipActive: {
    backgroundColor: colors.primary50,
    borderColor: colors.primary200,
  },
  chipText: {
    ...typography.xs,
    color: colors.slate600,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary700,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing['5'],
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.slate900,
  },
  modalList: {
    padding: spacing['2'],
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing['4'],
    borderRadius: radius.xl,
  },
  modalItemText: {
    ...typography.small,
    color: colors.slate700,
  },
  modalItemTextActive: {
    fontWeight: '700',
    color: colors.primary700,
  },
  statusItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default StudentFilters;
