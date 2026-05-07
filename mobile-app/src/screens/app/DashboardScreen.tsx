import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Card from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { api } from '@/services/api';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import type { AppTabParamList } from '@/navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

// Stat Card matching web StatCard component
interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trend?: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card padding="lg" style={styles.statCard}>
      <View style={styles.statRow}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </View>
    </Card>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-DRAWER_WIDTH))[0];
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  const currentRoute = useNavigationState(state => state.routes[state.index]?.name);

  // Fetch stats matching web dashboard
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/tenant/dashboard/stats');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch tenant info
  const { data: tenant } = useQuery({
    queryKey: ['tenant-me'],
    queryFn: async () => {
      const res = await api.get('/tenant/me');
      return res.data.data;
    },
  });

  const statsData = [
    { label: 'Total Students', value: stats?.totalStudents ?? '-', icon: 'people-outline' as const, color: '#3b82f6' },
    { label: 'Total Teachers', value: stats?.totalTeachers ?? '-', icon: 'school-outline' as const, color: '#8b5cf6' },
    { label: 'Active Branches', value: stats?.totalBranches ?? tenant?.branchCount ?? '-', icon: 'business-outline' as const, color: '#10b981' },
    { label: 'Total Pages', value: stats?.totalPages ?? '-', icon: 'document-text-outline' as const, color: '#f59e0b' },
  ];

  // Activity data matching web
  const activities = [
    { id: '01', title: 'Student admission processed', desc: 'New student record created', time: '5m ago' },
    { id: '02', title: 'Teacher onboarded', desc: 'New teacher profile completed', time: '2h ago' },
    { id: '03', title: 'Website page published', desc: 'Homepage updated and published', time: '1d ago' },
  ];

  // Quick actions matching web sidebar
  const quickActions = [
    { label: 'Add New Student', icon: 'person-add-outline' },
    { label: 'Mark Attendance', icon: 'checkbox-outline' },
    { label: 'Manage Sessions', icon: 'calendar-outline' },
    { label: 'Institution Config', icon: 'settings-outline' },
  ];

  // Navigation items matching web sidebar with routes (must match AppTabs screen names)
  const navItems = [
    { label: 'Dashboard', icon: 'grid-outline', route: 'Dashboard', active: currentRoute === 'Dashboard' },
    { label: 'Website Builder', icon: 'globe-outline', route: 'Builder', active: currentRoute === 'Builder' },
    { label: 'Leads', icon: 'people-outline', route: 'Leads', active: currentRoute === 'Leads' },
    { label: 'Branches', icon: 'business-outline', route: 'Dashboard', active: false },
    { label: 'Sessions', icon: 'calendar-outline', route: 'Dashboard', active: false },
    { label: 'Settings', icon: 'settings-outline', route: 'Settings', active: currentRoute === 'Settings' },
  ];

  const handleNavPress = (route: keyof AppTabParamList) => {
    closeDrawer();
    // Small delay to let drawer close animation start
    setTimeout(() => {
      navigation.navigate(route);
    }, 100);
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Drawer Modal Overlay */}
      {drawerOpen && (
        <Modal
          transparent
          visible={drawerOpen}
          animationType="none"
          onRequestClose={closeDrawer}
        >
          <View style={styles.overlayContainer}>
            {/* Backdrop */}
            <TouchableOpacity 
              style={styles.backdrop} 
              activeOpacity={1} 
              onPress={closeDrawer}
            />
            {/* Drawer Content */}
            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
              <SafeAreaView style={[styles.drawerSafeArea, { paddingTop: insets.top }]} edges={[]}>
                {/* Drawer Header */}
                <View style={styles.drawerHeader}>
                  <View style={styles.drawerBrand}>
                    <View style={styles.brandIcon}>
                      <Text style={styles.brandInitial}>{tenant?.displayName?.charAt(0) || 'A'}</Text>
                    </View>
                    <View style={styles.brandTextContainer}>
                      <Text style={styles.brandTitle} numberOfLines={1}>{tenant?.displayName || 'Admin Portal'}</Text>
                      <Text style={styles.brandSubtitle}>ADMIN PORTAL</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={closeDrawer} style={styles.drawerCloseBtn} activeOpacity={0.7}>
                    <Ionicons name="close" size={22} color={colors.slate700} />
                  </TouchableOpacity>
                </View>

                {/* Navigation Items */}
                <View style={styles.navItems}>
                  {navItems.map((item) => (
                    <TouchableOpacity 
                      key={item.label} 
                      style={[styles.navItem, item.active && styles.navItemActive]}
                      onPress={() => handleNavPress(item.route as keyof AppTabParamList)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.navIconContainer, item.active && styles.navIconContainerActive]}>
                        <Ionicons 
                          name={item.icon as any} 
                          size={20} 
                          color={item.active ? colors.white : colors.slate500} 
                        />
                      </View>
                      <Text style={[styles.navText, item.active && styles.navTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Bottom Actions */}
                <View style={styles.drawerBottom}>
                  <TouchableOpacity style={styles.helpItem}>
                    <Ionicons name="help-circle-outline" size={20} color={colors.slate400} />
                    <Text style={styles.helpText}>Help Center</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quitItem}>
                    <Ionicons name="log-out-outline" size={20} color={colors.red500} />
                    <Text style={styles.quitText}>Quit Session</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Top Header with Hamburger */}
      <View style={styles.topNavHeader}>
        <TouchableOpacity onPress={openDrawer} style={styles.hamburgerButton}>
          <Ionicons name="menu" size={24} color={colors.slate700} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={colors.slate600} />
          </TouchableOpacity>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{tenant?.displayName?.charAt(0) || 'A'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={statsLoading} onRefresh={() => void refetch()} />}
      >
        {/* Welcome Header matching web */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Ionicons name="sparkles" size={16} color={colors.amber500} />
            <Text style={styles.badgeText}>LIVE OVERVIEW</Text>
          </View>
          <Text style={styles.title}>
            Welcome back, <Text style={styles.titleAccent}>{tenant?.displayName || 'Admin'}</Text>
          </Text>
          <Text style={styles.subtitle}>Manage your institution from one place</Text>
          
          {/* Action buttons row */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.primaryActionBtn}>
              <Ionicons name="calendar-outline" size={18} color={colors.white} />
              <Text style={styles.primaryActionText}>View Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryActionBtn}>
              <Ionicons name="add-circle-outline" size={18} color={colors.slate700} />
              <Text style={styles.secondaryActionText}>New Entry</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        {statsLoading ? (
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={100} borderRadius={radius['3xl']} />
            ))}
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {statsData.map((item) => (
              <StatCard
                key={item.label}
                label={item.label}
                value={item.value}
                icon={item.icon}
                color={item.color}
              />
            ))}
          </View>
        )}

        {/* Two Column Layout: Recent Activity + Quick Actions */}
        <View style={styles.twoColumnLayout}>
          {/* Recent Activity - Left Column (2/3) */}
          <Card padding="lg" style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <Text style={styles.sectionSubtitle}>Latest actions across your institution</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.activityList}>
              {activities.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityNumberBadge}>
                    <Text style={styles.activityNumber}>{activity.id}</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDesc}>{activity.desc}</Text>
                  </View>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                    <View style={styles.successBadge}>
                      <Text style={styles.successBadgeText}>Success</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Quick Actions - Right Column (1/3) */}
          <View style={styles.quickActionsCard}>
            <View style={styles.quickActionsHeader}>
              <Ionicons name="sparkles" size={20} color={colors.amber400} />
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            </View>
            <Text style={styles.quickActionsSubtitle}>Common tasks you might want to perform</Text>
            
            <View style={styles.quickActionsList}>
              {quickActions.map((action, index) => (
                <TouchableOpacity 
                  key={action.label} 
                  style={[
                    styles.quickActionItem,
                    index === 0 && styles.quickActionItemPrimary,
                    index === 1 && styles.quickActionItemSecondary,
                  ]}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                    <Ionicons name={action.icon as any} size={20} color={colors.white} />
                  </View>
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.slate50 },
  screen: { flex: 1, backgroundColor: colors.slate50 },
  container: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing['3xl'] },

  // Header styles matching web
  header: {
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
  titleAccent: {
    color: colors.primary600,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate500,
    marginTop: spacing[1],
  },

  // Action buttons row
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing.md,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary600,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  secondaryActionText: {
    color: colors.slate700,
    fontSize: 14,
    fontWeight: '700',
  },

  // Stats Grid
  skeletonGrid: {
    gap: spacing[3],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: radius['2xl'],
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate500,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
  },

  // Two Column Layout - Stack vertically on mobile
  twoColumnLayout: {
    flexDirection: 'column',
    gap: spacing[3],
  },

  // Activity Card
  activityCard: {
    borderRadius: radius['2xl'],
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.slate900,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.slate500,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary600,
  },
  activityList: {
    gap: spacing[3],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  activityNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate600,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.slate900,
  },
  activityDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.slate500,
  },
  activityMeta: {
    alignItems: 'flex-end',
    gap: spacing[1],
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.slate400,
  },
  successBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.md,
    backgroundColor: '#dcfce7',
  },
  successBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },

  // Quick Actions Card
  quickActionsCard: {
    backgroundColor: colors.slate900,
    borderRadius: radius['2xl'],
    padding: spacing.md,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  quickActionsSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.slate400,
    marginBottom: spacing[4],
  },
  quickActionsList: {
    gap: spacing[2],
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.lg,
    backgroundColor: colors.slate800,
  },
  quickActionItemPrimary: {
    backgroundColor: '#059669',
  },
  quickActionItemSecondary: {
    backgroundColor: '#4f46e5',
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },

  // Drawer Styles
  overlayContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerSafeArea: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    paddingTop: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  drawerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.slate800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  brandTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate900,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.8,
  },
  drawerCloseBtn: {
    marginLeft: spacing[2],
    padding: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItems: {
    padding: spacing[4],
    gap: spacing[1],
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radius.lg,
  },
  navItemActive: {
    backgroundColor: '#059669',
  },
  navIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconContainerActive: {
    // No additional styling needed when item is active
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate600,
  },
  navTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  drawerBottom: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    gap: spacing[2],
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.slate600,
  },
  quitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  quitText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
  },

  // Top Header Styles
  topNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing[3],
    backgroundColor: colors.slate50,
  },
  hamburgerButton: {
    padding: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconButton: {
    padding: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: radius.xl,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});
