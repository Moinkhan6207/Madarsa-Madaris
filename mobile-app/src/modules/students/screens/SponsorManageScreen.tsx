import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { useStudent, useLinkSponsor, useUnlinkSponsor } from '@/modules/students/hooks';
import { useSponsors } from '@/modules/students/utils/reference';
import { SponsorCard } from '@/modules/students/components/SponsorCard';
import type { StudentsStackParamList } from '@/navigation/types';

type RouteProps = RouteProp<StudentsStackParamList, 'SponsorManage'>;
type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

export default function SponsorManageScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { studentId } = route.params;

  const { data: student, isLoading, refetch } = useStudent(studentId);
  const { data: sponsors = [], isLoading: sponsorsLoading } = useSponsors();
  const linkMutation = useLinkSponsor(studentId);
  const unlinkMutation = useUnlinkSponsor(studentId);

  const [sponsorId, setSponsorId] = useState('');
  const [amount, setAmount] = useState('');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [supportLabel, setSupportLabel] = useState('');
  const [notes, setNotes] = useState('');

  const mappings = student?.sponsors?.filter((s) => !s.deletedAt) ?? [];
  const mappedSponsorIds = useMemo(() => new Set(mappings.map((mapping) => mapping.sponsorId)), [mappings]);

  const handleLink = async () => {
    if (!sponsorId) {
      Alert.alert('Validation error', 'Please choose a sponsor.');
      return;
    }

    try {
      await linkMutation.mutateAsync({
        sponsorId,
        amount: amount ? Number(amount) : undefined,
        currencyCode: currencyCode || undefined,
        supportLabel: supportLabel.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSponsorId('');
      setAmount('');
      setCurrencyCode('INR');
      setSupportLabel('');
      setNotes('');
      refetch();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error?.message || 'Failed to link sponsor.');
    }
  };

  const handleUnlink = (id: string) => {
    Alert.alert('Unlink Sponsor?', 'This removes the sponsor mapping from the student.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unlink',
        style: 'destructive',
        onPress: async () => {
          await unlinkMutation.mutateAsync(id);
          refetch();
        },
      },
    ]);
  };

  if (isLoading || sponsorsLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary600} />
          <Text style={styles.loadingText}>Loading sponsors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.slate700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Sponsors</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Link Sponsor</Text>
          <Text style={styles.label}>Available Sponsors</Text>
          <View style={styles.chipWrap}>
            {sponsors.map((sponsor) => {
              const disabled = mappedSponsorIds.has(sponsor.id);
              const active = sponsorId === sponsor.id;
              return (
                <TouchableOpacity
                  key={sponsor.id}
                  disabled={disabled}
                  style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
                  onPress={() => setSponsorId(sponsor.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive, disabled && styles.chipTextDisabled]}>
                    {sponsor.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Amount</Text>
              <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" placeholderTextColor={colors.slate300} />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Currency</Text>
              <TextInput style={styles.input} value={currencyCode} onChangeText={setCurrencyCode} placeholder="INR" placeholderTextColor={colors.slate300} autoCapitalize="characters" />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Support Label</Text>
            <TextInput style={styles.input} value={supportLabel} onChangeText={setSupportLabel} placeholder="Monthly stipend" placeholderTextColor={colors.slate300} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput style={[styles.input, styles.notesInput]} value={notes} onChangeText={setNotes} placeholder="Optional notes" placeholderTextColor={colors.slate300} multiline />
          </View>
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleLink} disabled={linkMutation.isPending}>
            {linkMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnPrimaryText}>Link Sponsor</Text>}
          </TouchableOpacity>
        </View>

        {mappings.map((mapping) => (
          <View key={mapping.id} style={{ gap: spacing['2'] }}>
            <SponsorCard mapping={mapping} />
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleUnlink(mapping.sponsorId)}>
              <Ionicons name="trash-outline" size={16} color={colors.red500} />
              <Text style={[styles.actionText, { color: colors.red500 }]}>Unlink</Text>
            </TouchableOpacity>
          </View>
        ))}
        {mappings.length === 0 && <Text style={styles.emptyText}>No sponsors linked.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing['4'], paddingVertical: spacing['3'] },
  backBtn: { width: 40, height: 40, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.slate200, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.heading, color: colors.slate900, flex: 1, textAlign: 'center', marginHorizontal: spacing['2'] },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['3'] },
  loadingText: { ...typography.body, color: colors.slate400 },
  scroll: { paddingHorizontal: spacing['4'], paddingBottom: spacing['6'], gap: spacing['4'] },
  formCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing['5'], borderWidth: 1, borderColor: colors.slate100, gap: spacing['3'] },
  formTitle: { ...typography.heading, color: colors.slate900, marginBottom: spacing['1'] },
  inputGroup: { gap: spacing['1.5'] },
  label: { ...typography.smallBold, color: colors.slate600 },
  input: { backgroundColor: colors.slate50, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate200, paddingHorizontal: spacing['4'], paddingVertical: spacing['3'], ...typography.small, color: colors.slate900 },
  notesInput: { minHeight: 96, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', gap: spacing['3'] },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  chip: { paddingHorizontal: spacing['3'], paddingVertical: spacing['2'], borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.slate200 },
  chipActive: { backgroundColor: colors.primary50, borderColor: colors.primary600 },
  chipDisabled: { backgroundColor: colors.slate100, borderColor: colors.slate200 },
  chipText: { ...typography.xs, color: colors.slate600, fontWeight: '600' },
  chipTextActive: { color: colors.primary700, fontWeight: '800' },
  chipTextDisabled: { color: colors.slate400 },
  btn: { borderRadius: radius.xl, paddingVertical: spacing['3'], alignItems: 'center', flex: 1 },
  btnPrimary: { backgroundColor: colors.primary600 },
  btnPrimaryText: { ...typography.smallBold, color: colors.white },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'], backgroundColor: colors.white, paddingHorizontal: spacing['3'], paddingVertical: spacing['2'], borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate200, alignSelf: 'flex-start' },
  actionText: { ...typography.xsBold, color: colors.primary600 },
  emptyText: { ...typography.small, color: colors.slate400, textAlign: 'center', paddingVertical: spacing['4'] },
});
