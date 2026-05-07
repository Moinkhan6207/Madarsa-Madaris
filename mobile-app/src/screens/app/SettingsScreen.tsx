import React, { useState } from 'react';
import {
  ActivityIndicator,
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

import Card from '@/components/ui/Card';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { cmsService } from '@/services/cmsService';

const TABS = ['general', 'appearance', 'contact', 'social'] as const;
type Tab = (typeof TABS)[number];

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['cms-settings'],
    queryFn: () => cmsService.getSettings(),
  });

  const [form, setForm] = useState({
    siteTitle: '',
    metaDescription: '',
    footerText: '',
    logoUrl: '',
    primaryColor: '',
    secondaryColor: '',
    publicEmail: '',
    publicPhone: '',
    whatsappNumber: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
  });

  React.useEffect(() => {
    if (settings?.data) {
      const s = settings.data;
      setForm({
        siteTitle: s.siteTitle || '',
        metaDescription: s.metaDescription || '',
        footerText: s.footerText || '',
        logoUrl: s.logoUrl || '',
        primaryColor: s.primaryColor || '#10b981',
        secondaryColor: s.secondaryColor || '#059669',
        publicEmail: s.publicEmail || '',
        publicPhone: s.publicPhone || '',
        whatsappNumber: s.whatsappNumber || '',
        facebookUrl: s.facebookUrl || '',
        instagramUrl: s.instagramUrl || '',
        youtubeUrl: s.youtubeUrl || '',
        twitterUrl: s.twitterUrl || '',
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: () => cmsService.updateSettings(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-settings'] });
      setToast({ message: 'Settings saved successfully', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: () => {
      setToast({ message: 'Failed to save settings', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const renderInput = (label: string, key: keyof typeof form, placeholder: string, icon?: string) => (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputBox}>
        {icon && <Ionicons name={icon as any} size={18} color={colors.slate400} style={styles.inputIcon} />}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.slate400}
          value={form[key]}
          onChangeText={v => updateField(key, v)}
        />
      </View>
    </View>
  );

  const renderGeneralTab = () => (
    <View style={styles.tabContent}>
      {renderInput('Site Title', 'siteTitle', 'My Madarsa Website')}
      {renderInput('Meta Description', 'metaDescription', 'Brief description for SEO')}
      {renderInput('Footer Text', 'footerText', 'Copyright 2024 My Madarsa')}
    </View>
  );

  const renderAppearanceTab = () => (
    <View style={styles.tabContent}>
      {renderInput('Logo URL', 'logoUrl', 'https://example.com/logo.png')}
      {renderInput('Primary Color', 'primaryColor', '#10b981')}
      {renderInput('Secondary Color', 'secondaryColor', '#059669')}
      <View style={styles.colorPreviewWrap}>
        <View style={[styles.colorPreview, { backgroundColor: form.primaryColor || colors.primary600 }]} />
        <View style={[styles.colorPreview, { backgroundColor: form.secondaryColor || colors.primary700 }]} />
      </View>
    </View>
  );

  const renderContactTab = () => (
    <View style={styles.tabContent}>
      {renderInput('Public Email', 'publicEmail', 'contact@madarsa.org', 'mail-outline')}
      {renderInput('Public Phone', 'publicPhone', '+92 300 1234567', 'call-outline')}
      {renderInput('WhatsApp Number', 'whatsappNumber', '+92 300 1234567', 'logo-whatsapp')}
    </View>
  );

  const renderSocialTab = () => (
    <View style={styles.tabContent}>
      {renderInput('Facebook URL', 'facebookUrl', 'https://facebook.com/...', 'logo-facebook')}
      {renderInput('Instagram URL', 'instagramUrl', 'https://instagram.com/...', 'logo-instagram')}
      {renderInput('YouTube URL', 'youtubeUrl', 'https://youtube.com/...', 'logo-youtube')}
      {renderInput('Twitter/X URL', 'twitterUrl', 'https://x.com/...', 'logo-twitter')}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Website Settings</Text>
          <Text style={styles.subtitle}>Manage branding, contact, and social links</Text>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={styles.tabsRow}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Content */}
        <Card style={styles.contentCard}>
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary600} />
            </View>
          ) : (
            <>
              {activeTab === 'general' && renderGeneralTab()}
              {activeTab === 'appearance' && renderAppearanceTab()}
              {activeTab === 'contact' && renderContactTab()}
              {activeTab === 'social' && renderSocialTab()}
            </>
          )}
        </Card>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, updateMutation.isPending && { opacity: 0.7 }]}
          onPress={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color={colors.white} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

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

  header: { gap: spacing.xs },
  title: { ...typography.h1, color: colors.slate900 },
  subtitle: { ...typography.body, color: colors.slate500 },

  tabScroll: { flexGrow: 0 },
  tabsRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  tabBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
  },
  tabBtnActive: {
    backgroundColor: colors.primary600,
    borderColor: colors.primary600,
  },
  tabText: { ...typography.small, color: colors.slate600, fontWeight: '600' },
  tabTextActive: { color: colors.white, fontWeight: '700' },

  contentCard: { padding: spacing.lg, borderRadius: radius.xl, gap: spacing.md },
  tabContent: { gap: spacing.md },

  inputWrap: { gap: spacing.xs },
  inputLabel: { ...typography.small, color: colors.slate700, fontWeight: '700' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.slate50,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  inputIcon: { marginRight: spacing.xs },
  input: { flex: 1, ...typography.body, color: colors.slate900, paddingVertical: spacing.sm },

  colorPreviewWrap: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  colorPreview: { width: 40, height: 40, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.slate200 },

  loadingWrap: { paddingVertical: spacing['3xl'], alignItems: 'center' },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.slate900,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  saveBtnText: { ...typography.body, color: colors.white, fontWeight: '700' },

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
