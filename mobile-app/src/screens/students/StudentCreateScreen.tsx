import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { useCreateStudent } from '@/features/students/hooks';
import type { StudentsStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

export default function StudentCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const createMutation = useCreateStudent();

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', branchId: '', currentProgram: '', currentClass: '', gender: '', dateOfBirth: '', admissionDate: '', addressLine1: '', city: '', state: '', country: '', postalCode: '', isOrphan: false, isNeedy: false, notes: '' });
  const [guardians, setGuardians] = useState<Array<{ relation: string; fullName: string; phone: string; isPrimary: boolean }>>([]);
  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.branchId.trim()) { Alert.alert('Validation Error', 'First name and Branch are required.'); return; }
    try {
      await createMutation.mutateAsync({
        firstName: form.firstName.trim(), lastName: form.lastName.trim() || undefined, phone: form.phone.trim() || undefined, email: form.email.trim() || undefined,
        branchId: form.branchId.trim(), currentProgram: form.currentProgram.trim() || undefined, currentClass: form.currentClass.trim() || undefined,
        gender: form.gender.trim() || undefined, dateOfBirth: form.dateOfBirth || undefined, admissionDate: form.admissionDate || undefined,
        addressLine1: form.addressLine1.trim() || undefined, city: form.city.trim() || undefined, state: form.state.trim() || undefined,
        country: form.country.trim() || undefined, postalCode: form.postalCode.trim() || undefined, isOrphan: form.isOrphan, isNeedy: form.isNeedy,
        notes: form.notes.trim() || undefined,
        guardians: guardians.length > 0 ? guardians.map((g) => ({ relation: g.relation as any, fullName: g.fullName, phone: g.phone, isPrimary: g.isPrimary })) : undefined,
      });
      navigation.goBack();
    } catch { Alert.alert('Error', 'Failed to create student.'); }
  };

  const addGuardian = () => setGuardians((prev) => [...prev, { relation: 'FATHER', fullName: '', phone: '', isPrimary: prev.length === 0 }]);
  const removeGuardian = (index: number) => setGuardians((prev) => prev.filter((_, i) => i !== index));
  const updateGuardian = (index: number, key: string, value: any) => setGuardians((prev) => prev.map((g, i) => (i === index ? { ...g, [key]: value } : key === 'isPrimary' && value === true ? { ...g, isPrimary: false } : g)));

  const Input = ({ label, placeholder, value, onChangeText, keyboardType, autoCapitalize }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholder={placeholder} value={value} onChangeText={onChangeText} keyboardType={keyboardType} autoCapitalize={autoCapitalize} placeholderTextColor={colors.slate300} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.slate700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Student</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}><Text style={styles.sectionTitle}>Basic Information</Text>
          <Input label="First Name *" placeholder="First name" value={form.firstName} onChangeText={(v: string) => update('firstName', v)} />
          <Input label="Last Name" placeholder="Last name" value={form.lastName} onChangeText={(v: string) => update('lastName', v)} />
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Gender</Text><TextInput style={styles.input} value={form.gender} onChangeText={(v) => update('gender', v)} placeholder="Male/Female" placeholderTextColor={colors.slate300} /></View>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>DOB</Text><TextInput style={styles.input} value={form.dateOfBirth} onChangeText={(v) => update('dateOfBirth', v)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.slate300} /></View>
          </View>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Contact</Text>
          <Input label="Phone" placeholder="Phone number" value={form.phone} onChangeText={(v: string) => update('phone', v)} keyboardType="phone-pad" />
          <Input label="Email" placeholder="Email address" value={form.email} onChangeText={(v: string) => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Address" placeholder="Street address" value={form.addressLine1} onChangeText={(v: string) => update('addressLine1', v)} />
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>City</Text><TextInput style={styles.input} value={form.city} onChangeText={(v) => update('city', v)} placeholder="City" placeholderTextColor={colors.slate300} /></View>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>State</Text><TextInput style={styles.input} value={form.state} onChangeText={(v) => update('state', v)} placeholder="State" placeholderTextColor={colors.slate300} /></View>
          </View>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Academic Details</Text>
          <Input label="Branch ID *" placeholder="Branch UUID" value={form.branchId} onChangeText={(v: string) => update('branchId', v)} />
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Program</Text><TextInput style={styles.input} value={form.currentProgram} onChangeText={(v) => update('currentProgram', v)} placeholder="Hifz/Nazra" placeholderTextColor={colors.slate300} /></View>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Class</Text><TextInput style={styles.input} value={form.currentClass} onChangeText={(v) => update('currentClass', v)} placeholder="Class" placeholderTextColor={colors.slate300} /></View>
          </View>
          <Input label="Admission Date" placeholder="YYYY-MM-DD" value={form.admissionDate} onChangeText={(v: string) => update('admissionDate', v)} />
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Flags</Text>
          <View style={styles.flagRow}><Text style={styles.flagLabel}>Orphan</Text><Switch value={form.isOrphan} onValueChange={(v) => update('isOrphan', v)} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={form.isOrphan ? colors.primary600 : colors.slate400} /></View>
          <View style={styles.flagRow}><Text style={styles.flagLabel}>Needy</Text><Switch value={form.isNeedy} onValueChange={(v) => update('isNeedy', v)} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={form.isNeedy ? colors.primary600 : colors.slate400} /></View>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Guardians</Text>
            <TouchableOpacity onPress={addGuardian} style={styles.addBtn}><Ionicons name="add" size={18} color={colors.primary600} /><Text style={styles.addBtnText}>Add</Text></TouchableOpacity>
          </View>
          {guardians.map((g, i) => (
            <View key={i} style={styles.guardianCard}>
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Relation</Text><TextInput style={styles.input} value={g.relation} onChangeText={(v) => updateGuardian(i, 'relation', v)} placeholder="FATHER" placeholderTextColor={colors.slate300} /></View>
                <View style={[styles.inputGroup, { flex: 2 }]}><Text style={styles.label}>Name</Text><TextInput style={styles.input} value={g.fullName} onChangeText={(v) => updateGuardian(i, 'fullName', v)} placeholder="Full name" placeholderTextColor={colors.slate300} /></View>
              </View>
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 2 }]}><Text style={styles.label}>Phone</Text><TextInput style={styles.input} value={g.phone} onChangeText={(v) => updateGuardian(i, 'phone', v)} placeholder="Phone" keyboardType="phone-pad" placeholderTextColor={colors.slate300} /></View>
                <TouchableOpacity onPress={() => removeGuardian(i)} style={styles.removeBtn}><Ionicons name="trash-outline" size={18} color={colors.red500} /></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Notes</Text>
          <TextInput style={[styles.input, styles.notesInput]} value={form.notes} onChangeText={(v) => update('notes', v)} placeholder="Additional notes..." multiline numberOfLines={4} placeholderTextColor={colors.slate300} />
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={createMutation.isPending}>
          {createMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Create Student</Text>}

        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing['4'], paddingVertical: spacing['3'] },
  backBtn: { width: 40, height: 40, borderRadius: radius.xl, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.slate200, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.heading, color: colors.slate900, flex: 1, textAlign: 'center', marginHorizontal: spacing['2'] },
  scroll: { paddingHorizontal: spacing['4'], paddingBottom: spacing['6'], gap: spacing['5'] },
  section: { gap: spacing['3'] },
  sectionTitle: { ...typography.heading, color: colors.slate900 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputGroup: { gap: spacing['1.5'] },
  label: { ...typography.smallBold, color: colors.slate600 },
  input: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate200, paddingHorizontal: spacing['4'], paddingVertical: spacing['3'], ...typography.small, color: colors.slate900 },
  rowInputs: { flexDirection: 'row', gap: spacing['3'] },
  flagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radius.xl, paddingHorizontal: spacing['4'], paddingVertical: spacing['3'], borderWidth: 1, borderColor: colors.slate200 },
  flagLabel: { ...typography.small, color: colors.slate800 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'], backgroundColor: colors.primary50, paddingHorizontal: spacing['3'], paddingVertical: spacing['1.5'], borderRadius: radius.xl },
  addBtnText: { ...typography.smallBold, color: colors.primary600 },
  guardianCard: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate200, padding: spacing['4'], gap: spacing['3'] },
  removeBtn: { alignSelf: 'center', padding: spacing['2'] },
  notesInput: { height: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: colors.primary600, borderRadius: radius.xl, paddingVertical: spacing['4'], alignItems: 'center', marginTop: spacing['4'] },
  submitText: { ...typography.heading, color: colors.white },
});
