import React, { useState } from 'react';
import {
  Alert,
  Modal,
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert as UIAlert } from '@/components/ui/FormField';
import { Skeleton } from '@/components/ui/Skeleton';
import { cmsService, Page } from '@/services/cmsService';
import { AppTabParamList } from '@/navigation/types';
import { colors, radius, shadows, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<AppTabParamList, 'Builder'>;

// Toast component matching web
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <View style={[styles.toast, type === 'success' ? styles.toastSuccess : styles.toastError]}>
      <Ionicons name={type === 'success' ? 'checkmark-circle' : 'alert-circle'} size={20} color={colors.white} />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

// Page Card component matching web PageCard
function PageCard({
  page,
  onDelete,
  onTogglePublish,
  onSetHome,
}: {
  page: Page;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, status: boolean) => void;
  onSetHome: (id: string) => void;
}) {
  return (
    <Card padding="md" style={styles.pageCard}>
      {/* Header */}
      <View style={styles.pageCardHeader}>
        <View style={[styles.pageIconBox, page.isPublished ? styles.pageIconPublished : styles.pageIconDraft]}>
          <Ionicons name={page.isHomePage ? 'home' : 'layers'} size={24} color={page.isPublished ? colors.emerald600 : colors.amber500} />
        </View>
        <View style={styles.pageCardActions}>
          <TouchableOpacity style={styles.pageActionBtn}>
            <Ionicons name="eye-outline" size={18} color={colors.slate400} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => page.id && onDelete(page.id)} style={styles.pageActionBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.rose500} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title & Info */}
      <View style={styles.pageCardBody}>
        <View style={styles.pageTitleRow}>
          <Text style={styles.pageTitle}>{page.title}</Text>
          {page.isHomePage && (
            <View style={styles.homeBadge}>
              <Text style={styles.homeBadgeText}>HOME</Text>
            </View>
          )}
        </View>
        <View style={styles.pageSlugRow}>
          <Ionicons name="globe-outline" size={14} color={colors.slate400} />
          <Text style={styles.pageSlug}>/{page.slug}</Text>
        </View>

        {/* Status Toggle */}
        <View style={styles.pageStatusRow}>
          <TouchableOpacity
            onPress={() => page.id && onTogglePublish(page.id, !page.isPublished)}
            style={[styles.statusBtn, page.isPublished ? styles.statusPublished : styles.statusDraft]}
          >
            <Text style={[styles.statusText, page.isPublished ? styles.statusTextPublished : styles.statusTextDraft]}>
              {page.isPublished ? 'PUBLISHED' : 'DRAFT'}
            </Text>
          </TouchableOpacity>
          {!page.isHomePage && page.isPublished && (
            <TouchableOpacity onPress={() => page.id && onSetHome(page.id)} style={styles.homeBtn}>
              <Ionicons name="star" size={18} color={colors.amber500} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Footer / Edit Action */}
      <TouchableOpacity style={styles.editBtn}>
        <Ionicons name="create-outline" size={18} color={colors.white} />
        <Text style={styles.editBtnText}>Open Site Editor</Text>
      </TouchableOpacity>
    </Card>
  );
}

export default function WebsiteBuilderScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: () => cmsService.listPages(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      showToast('Page deleted successfully');
    },
    onError: () => showToast('Failed to delete page', 'error'),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      cmsService.updatePage(id, { isPublished: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      showToast('Page status updated');
    },
    onError: () => showToast('Failed to update status', 'error'),
  });

  const setHomeMutation = useMutation({
    mutationFn: (id: string) => cmsService.updatePage(id, { isHomePage: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      showToast('Homepage set successfully');
    },
    onError: () => showToast('Failed to set homepage', 'error'),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Page>) => cmsService.createPage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      setShowCreateModal(false);
      setNewPageTitle('');
      setNewPageSlug('');
      showToast('Page created successfully');
    },
    onError: () => showToast('Failed to create page', 'error'),
  });

  const pages = (data?.data?.pages || []) as Page[];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refetch()} />}
        >
        {/* Header matching web */}
        <View style={styles.header}>
          <View>
            <View style={styles.badgeRow}>
              <Ionicons name="sparkles" size={16} color={colors.amber500} />
              <Text style={styles.badgeText}>WEBSITE MANAGER</Text>
            </View>
            <Text style={styles.title}>Website Builder</Text>
            <Text style={styles.subtitle}>Create, edit, and publish pages for your institution</Text>
          </View>
          <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.createBtn}>
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.createBtnText}>New Page</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card padding="md" style={styles.statBox}>
            <Text style={styles.statValue}>{pages.length}</Text>
            <Text style={styles.statLabel}>Total Pages</Text>
          </Card>
          <Card padding="md" style={styles.statBox}>
            <Text style={styles.statValue}>{pages.filter((p: Page) => p.isPublished).length}</Text>
            <Text style={styles.statLabel}>Published</Text>
          </Card>
          <Card padding="md" style={styles.statBox}>
            <Text style={styles.statValue}>{pages.filter((p: Page) => !p.isPublished).length}</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </Card>
        </View>

        {/* Pages Grid */}
        {isLoading ? (
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={200} borderRadius={radius['3xl']} />
            ))}
          </View>
        ) : pages.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="layers-outline" size={40} color={colors.slate300} />
            </View>
            <Text style={styles.emptyTitle}>No pages yet</Text>
            <Text style={styles.emptySubtitle}>Create your first page to get started</Text>
            <Button title="Create First Page" onPress={() => setShowCreateModal(true)} style={styles.emptyBtn} />
          </Card>
        ) : (
          <View style={styles.pagesGrid}>
            {pages.map((page: Page, i: number) => (
              <PageCard
                key={page.id || i}
                page={page}
                onDelete={(id) => deleteMutation.mutate(id)}
                onTogglePublish={(id, status) => togglePublishMutation.mutate({ id, status })}
                onSetHome={(id) => setHomeMutation.mutate(id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal animationType="slide" transparent visible={showCreateModal} onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <Card padding="lg" style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Page</Text>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Page Title</Text>
              <TextInput
                value={newPageTitle}
                onChangeText={setNewPageTitle}
                placeholder="e.g. About Us"
                style={styles.modalInput}
                placeholderTextColor={colors.slate400}
              />
            </View>
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>URL Slug</Text>
              <TextInput
                value={newPageSlug}
                onChangeText={setNewPageSlug}
                placeholder="e.g. about"
                style={styles.modalInput}
                placeholderTextColor={colors.slate400}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setShowCreateModal(false)} />
              <Button
                title="Create Page"
                onPress={() =>
                  createMutation.mutate({
                    title: newPageTitle,
                    slug: newPageSlug.toLowerCase().replace(/\s+/g, '-'),
                    isPublished: false,
                  })
                }
                loading={createMutation.isPending}
              />
            </View>
          </Card>
        </View>
      </Modal>

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.slate50 },
  screen: { flex: 1, backgroundColor: colors.slate50 },
  container: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing['3xl'] },

  // Header styles matching web
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.amber600,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: colors.slate900,
    letterSpacing: -0.025,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate500,
    marginTop: spacing[1],
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.slate900,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.xl,
    ...shadows.slate,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
    color: colors.slate900,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: colors.slate400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Pages grid
  pagesGrid: {
    gap: spacing[4],
  },
  skeletonGrid: {
    gap: spacing[4],
  },

  // Page Card styles matching web
  pageCard: {
    gap: spacing[4],
  },
  pageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIconPublished: {
    backgroundColor: colors.emerald50,
  },
  pageIconDraft: {
    backgroundColor: colors.amber50,
  },
  pageCardActions: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  pageActionBtn: {
    padding: spacing[2],
    borderRadius: radius.xl,
    backgroundColor: colors.slate50,
  },
  pageCardBody: {
    gap: spacing[3],
  },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  pageTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '900',
    color: colors.slate900,
    letterSpacing: -0.025,
  },
  homeBadge: {
    backgroundColor: colors.emerald100,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  homeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.emerald700,
    letterSpacing: 0.5,
  },
  pageSlugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  pageSlug: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.slate400,
  },
  pageStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  statusBtn: {
    flex: 1,
    paddingVertical: spacing[2],
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusPublished: {
    backgroundColor: colors.emerald500,
    borderColor: colors.emerald500,
    ...shadows.primary,
  },
  statusDraft: {
    backgroundColor: colors.white,
    borderColor: colors.slate100,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusTextPublished: {
    color: colors.white,
  },
  statusTextDraft: {
    color: colors.slate400,
  },
  homeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: colors.slate50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.slate900,
    paddingVertical: spacing[4],
    borderRadius: radius['2xl'],
    ...shadows.slate,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.white,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '900',
    color: colors.slate900,
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate500,
    marginBottom: spacing[6],
  },
  emptyBtn: {
    minWidth: 200,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: [{ translateX: -100 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: radius['2xl'],
    ...shadows.lg,
  },
  toastSuccess: {
    backgroundColor: colors.emerald600,
  },
  toastError: {
    backgroundColor: colors.red600,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.white,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    gap: spacing[6],
  },
  modalTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '900',
    color: colors.slate900,
  },
  modalField: {
    gap: spacing[2],
  },
  modalLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.slate700,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
    color: colors.slate900,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'flex-end',
  },
});
