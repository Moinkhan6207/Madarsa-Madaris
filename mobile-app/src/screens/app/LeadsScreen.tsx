import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { colors, radius, shadows, spacing, typography } from '@/theme';
import Card from '@/components/ui/Card';
import Header from '@/components/layout/Header';
import { leadService, Lead, LeadStatus } from '@/services/leadService';

const statusFilters: { label: string; value: LeadStatus | 'all'; color: string }[] = [
  { label: 'All', value: 'all', color: colors.slate500 },
  { label: 'New', value: 'new', color: colors.primary600 },
  { label: 'Contacted', value: 'contacted', color: colors.amber500 },
  { label: 'Qualified', value: 'qualified', color: colors.blue700 },
  { label: 'Enrolled', value: 'enrolled', color: colors.emerald600 },
  { label: 'Lost', value: 'lost', color: colors.red400 },
];

const statusColors: Record<LeadStatus, string> = {
  new: colors.primary600,
  contacted: colors.amber500,
  qualified: colors.blue700,
  enrolled: colors.emerald600,
  lost: colors.red400,
};

const statusBgColors: Record<LeadStatus, string> = {
  new: colors.primary50,
  contacted: colors.amber50,
  qualified: '#eff6ff',
  enrolled: '#f0fdf4',
  lost: '#fef2f2',
};

export default function LeadsScreen() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['leads-stats'],
    queryFn: () => leadService.getStats(),
  });

  const { data: leadsData, isLoading, refetch } = useQuery({
    queryKey: ['leads', statusFilter, search],
    queryFn: () => leadService.list({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search.trim() || undefined,
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => leadService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
      setToast({ message: 'Status updated', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: () => {
      setToast({ message: 'Failed to update status', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
      setToast({ message: 'Lead deleted', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: () => {
      setToast({ message: 'Failed to delete lead', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const leads: Lead[] = leadsData?.data?.leads ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refetch()} />}
      >
        <Header
          title="Lead Management"
          subtitle="Track and manage prospective student inquiries"
        />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {statsLoading ? (
            <View style={styles.skeletonRow}>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={styles.skeletonStat} />
              ))}
            </View>
          ) : (
            <>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.data?.total ?? 0}</Text>
                <Text style={styles.statLabel}>Total Leads</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.primary600 }]}>{stats?.data?.new ?? 0}</Text>
                <Text style={styles.statLabel}>New</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.amber500 }]}>{stats?.data?.contacted ?? 0}</Text>
                <Text style={styles.statLabel}>Contacted</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.emerald600 }]}>{stats?.data?.enrolled ?? 0}</Text>
                <Text style={styles.statLabel}>Enrolled</Text>
              </Card>
            </>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.slate400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search leads by name, email, phone..."
            placeholderTextColor={colors.slate400}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.slate400} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {statusFilters.map(filter => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterBtn,
                  statusFilter === filter.value && { backgroundColor: filter.color, borderColor: filter.color },
                ]}
                onPress={() => setStatusFilter(filter.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    statusFilter === filter.value && { color: colors.white },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Leads List */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Leads</Text>
          <Text style={styles.listCount}>{leads.length} total</Text>
        </View>

        {isLoading && leads.length === 0 ? (
          <View style={styles.skeletonWrap}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.skeletonCard} />
            ))}
          </View>
        ) : leads.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={48} color={colors.slate300} />
            <Text style={styles.emptyTitle}>No leads found</Text>
            <Text style={styles.emptySub}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          leads.map(lead => (
            <Card key={lead.id} style={styles.leadCard}>
              <View style={styles.leadRow}>
                <View style={styles.leadInfo}>
                  <View style={styles.leadHeader}>
                    <Text style={styles.leadName}>{lead.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusBgColors[lead.status as LeadStatus] }]}>
                      <Text style={[styles.statusText, { color: statusColors[lead.status as LeadStatus] }]}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.leadDetail}>{lead.email}</Text>
                  <Text style={styles.leadDetail}>{lead.phone}</Text>
                  <Text style={styles.leadSource}>Source: {lead.source}</Text>
                </View>

                <TouchableOpacity
                  style={styles.expandBtn}
                  onPress={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                >
                  <Ionicons
                    name={expandedLead === lead.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.slate400}
                  />
                </TouchableOpacity>
              </View>

              {expandedLead === lead.id && (
                <View style={styles.expandedWrap}>
                  {lead.notes && (
                    <View style={styles.notesWrap}>
                      <Text style={styles.notesLabel}>Notes</Text>
                      <Text style={styles.notesText}>{lead.notes}</Text>
                    </View>
                  )}

                  <Text style={styles.actionLabel}>Change Status</Text>
                  <View style={styles.statusActions}>
                    {(['new', 'contacted', 'qualified', 'enrolled', 'lost'] as LeadStatus[]).map(status => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusActionBtn,
                          lead.status === status && { borderColor: statusColors[status], backgroundColor: statusBgColors[status] },
                        ]}
                        onPress={() => updateStatusMutation.mutate({ id: lead.id, status })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Text
                          style={[
                            styles.statusActionText,
                            lead.status === status && { color: statusColors[status], fontWeight: '700' },
                          ]}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteMutation.mutate(lead.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.red400} />
                    <Text style={styles.deleteText}>Delete Lead</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))
        )}

        {toast && (
          <View style={[styles.toast, { backgroundColor: toast.type === 'success' ? colors.emerald600 : colors.red400 }]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.slate50 },
  screen: { flex: 1, backgroundColor: colors.slate50 },
  container: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing['3xl'] },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, padding: spacing.md, alignItems: 'center', borderRadius: radius.xl },
  statValue: { ...typography.h2, color: colors.slate900, fontWeight: '800' },
  statLabel: { ...typography.small, color: colors.slate500, fontWeight: '600', marginTop: spacing.xs },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.slate900, paddingVertical: spacing.sm },

  // Filters
  filterScroll: { flexGrow: 0 },
  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
  },
  filterText: { ...typography.small, color: colors.slate600, fontWeight: '600' },

  // List Header
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  listTitle: { ...typography.heading, color: colors.slate900 },
  listCount: { ...typography.small, color: colors.slate500 },

  // Lead Card
  leadCard: { padding: spacing.md, borderRadius: radius.xl },
  leadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  leadInfo: { flex: 1, gap: spacing[2] },
  leadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[1] },
  leadName: { ...typography.body, fontWeight: '700', color: colors.slate900 },
  statusBadge: { paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: radius.full },
  statusText: { ...typography.xs, fontWeight: '700' },
  leadDetail: { ...typography.small, color: colors.slate600 },
  leadSource: { ...typography.xs, color: colors.slate400, fontWeight: '600' },
  expandBtn: { padding: spacing.xs },

  // Expanded
  expandedWrap: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.slate100, gap: spacing.md },
  notesWrap: { gap: spacing.xs },
  notesLabel: { ...typography.small, color: colors.slate500, fontWeight: '700' },
  notesText: { ...typography.small, color: colors.slate700 },
  actionLabel: { ...typography.small, color: colors.slate500, fontWeight: '700' },
  statusActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusActionBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
  },
  statusActionText: { ...typography.small, color: colors.slate600 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    marginTop: spacing.sm,
  },
  deleteText: { ...typography.small, color: colors.red400, fontWeight: '700' },

  // Empty State
  emptyWrap: { alignItems: 'center', paddingVertical: spacing['3xl'], gap: spacing.md },
  emptyTitle: { ...typography.heading, color: colors.slate500 },
  emptySub: { ...typography.small, color: colors.slate400 },

  // Skeleton
  skeletonRow: { flexDirection: 'row', gap: spacing.sm },
  skeletonStat: { flex: 1, height: 72, borderRadius: radius.xl, backgroundColor: colors.slate200 },
  skeletonWrap: { gap: spacing.md },
  skeletonCard: { height: 100, borderRadius: radius.xl, backgroundColor: colors.slate200 },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 24,
    left: spacing.md,
    right: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  toastText: { color: colors.white, ...typography.body, fontWeight: '700' },
});
