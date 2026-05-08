import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { useStudent, useAddGuardian, useUpdateGuardian, useRemoveGuardian } from '@/features/students/hooks';
import { GuardianCard } from '@/features/students/components/GuardianCard';
import type { StudentsStackParamList } from '@/navigation/types';

type RouteProps = RouteProp<StudentsStackParamList, 'GuardianManage'>;
type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

export default function GuardianManageScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { studentId } = route.params;

  const { data: student, isLoading, refetch } = useStudent(studentId);
  const addMutation = useAddGuardian(studentId);
  const updateMutation = useUpdateGuardian(studentId);
  const removeMutation = useRemoveGuardian(studentId);

  const [form, setForm] = useState({ relation: 'FATHER', fullName: '', phone: '', email: '', addressLine1: '', isPrimary: false });
  const [editingId, setEditingId] = useState<string | null>(null);

  const guardians = student?.guardians?.filter((g) => !g.deletedAt) ?? [];

  const handleAdd = async () => {
    if (!form.fullName.trim()) { Alert.alert('Error', 'Full name is required'); return; }
    await addMutation.mutateAsync(form as any); setForm({ relation: 'FATHER', fullName: '', phone: '', email: '', addressLine1: '', isPrimary: false }); refetch();
  };

  const handleUpdate = async (id: string) => {
    await updateMutation.mutateAsync({ id, data: { relation: form.relation as any, fullName: form.fullName, phone: form.phone || undefined, email: form.email || undefined, addressLine1: form.addressLine1 || undefined, isPrimary: form.isPrimary } as any });
    setEditingId(null); setForm({ relation: 'FATHER', fullName: '', phone: '', email: '', addressLine1: '', isPrimary: false }); refetch();
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove Guardian?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await removeMutation.mutateAsync(id); refetch(); } },
    ]);
  };

  const startEdit = (g: any) => { setEditingId(g.id); setForm({ relation: g.relation, fullName: g.fullName, phone: g.phone || '', email: g.email || '', addressLine1: g.addressLine1 || '', isPrimary: g.isPrimary }); };

  if (isLoading) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color={colors.slate700} /></TouchableOpacity><Text style={styles.headerTitle}>Manage Guardians</Text><View style={{ width: 40 }} /></View>
      <View style={styles.loading}><ActivityIndicator color={colors.primary600} /><Text style={styles.loadingText}>Loading...</Text></View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color={colors.slate700} /></TouchableOpacity><Text style={styles.headerTitle}>Manage Guardians</Text><View style={{ width: 40 }} /></View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editingId ? 'Edit Guardian' : 'Add Guardian'}</Text>
          <View style={styles.inputGroup}><Text style={styles.label}>Relation</Text><TextInput style={styles.input} value={form.relation} onChangeText={(v) => setForm((f) => ({ ...f, relation: v }))} placeholder="FATHER" placeholderTextColor={colors.slate300} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Full Name *</Text><TextInput style={styles.input} value={form.fullName} onChangeText={(v) => setForm((f) => ({ ...f, fullName: v }))} placeholder="Full name" placeholderTextColor={colors.slate300} /></View>
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Phone</Text><TextInput style={styles.input} value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="Phone" keyboardType="phone-pad" placeholderTextColor={colors.slate300} /></View>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Email</Text><TextInput style={styles.input} value={form.email} onChangeText={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.slate300} /></View>
          </View>
          <View style={styles.inputGroup}><Text style={styles.label}>Address</Text><TextInput style={styles.input} value={form.addressLine1} onChangeText={(v) => setForm((f) => ({ ...f, addressLine1: v }))} placeholder="Address" placeholderTextColor={colors.slate300} /></View>
          {editingId ? (
            <View style={styles.rowInputs}>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => { setEditingId(null); setForm({ relation: 'FATHER', fullName: '', phone: '', email: '', addressLine1: '', isPrimary: false }); }}><Text style={styles.btnSecondaryText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => handleUpdate(editingId)} disabled={updateMutation.isPending}>{updateMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnPrimaryText}>Update</Text>}</TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleAdd} disabled={addMutation.isPending}>{addMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnPrimaryText}>Add Guardian</Text>}</TouchableOpacity>
          )}
        </View>

        {/* List */}
        {guardians.map((g) => (
          <View key={g.id} style={{ gap: spacing['2'] }}>
            <GuardianCard guardian={g} />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => startEdit(g)}><Ionicons name="create-outline" size={16} color={colors.primary600} /><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleRemove(g.id)}><Ionicons name="trash-outline" size={16} color={colors.red500} /><Text style={[styles.actionText, { color: colors.red500 }]}>Remove</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        {guardians.length === 0 && <Text style={styles.emptyText}>No guardians added.</Text>}
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
  rowInputs: { flexDirection: 'row', gap: spacing['3'] },
  btn: { borderRadius: radius.xl, paddingVertical: spacing['3'], alignItems: 'center', flex: 1 },
  btnPrimary: { backgroundColor: colors.primary600 },
  btnPrimaryText: { ...typography.smallBold, color: colors.white },
  btnSecondary: { backgroundColor: colors.slate100 },
  btnSecondaryText: { ...typography.smallBold, color: colors.slate600 },
  actionRow: { flexDirection: 'row', gap: spacing['3'] },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'], backgroundColor: colors.white, paddingHorizontal: spacing['3'], paddingVertical: spacing['2'], borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate200 },
  actionText: { ...typography.xsBold, color: colors.primary600 },
  emptyText: { ...typography.small, color: colors.slate400, textAlign: 'center', paddingVertical: spacing['4'] },
});
