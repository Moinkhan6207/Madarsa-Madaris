import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { useStudent, useUpdateStudent } from '@/features/students/hooks';
import type { StudentsStackParamList } from '@/navigation/types';

type RouteProps = RouteProp<StudentsStackParamList, 'StudentEdit'>;
type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

export default function StudentEditScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { studentId } = route.params;

  const { data: student, isLoading } = useStudent(studentId);
  const updateMutation = useUpdateStudent(studentId);

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', branchId: '', currentProgram: '', currentClass: '', gender: '', dateOfBirth: '', addressLine1: '', city: '', state: '', country: '', postalCode: '', isOrphan: false, isNeedy: false, notes: '' });
  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (student) {
      setForm({ firstName: student.firstName || '', lastName: student.lastName || '', phone: student.phone || '', email: student.email || '', branchId: student.branchId || '', currentProgram: student.currentProgram || '', currentClass: student.currentClass || '', gender: student.gender || '', dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0, 10) : '', addressLine1: student.addressLine1 || '', city: student.city || '', state: student.state || '', country: student.country || '', postalCode: student.postalCode || '', isOrphan: student.isOrphan || false, isNeedy: student.isNeedy || false, notes: student.notes || '' });
    }
  }, [student]);

  const handleSubmit = async () => {
    if (!form.firstName.trim()) { Alert.alert('Validation Error', 'First name is required.'); return; }
    try {
      await updateMutation.mutateAsync({
        firstName: form.firstName.trim(), lastName: form.lastName.trim() || undefined, phone: form.phone.trim() || undefined, email: form.email.trim() || undefined,
        branchId: form.branchId.trim() || undefined, currentProgram: form.currentProgram.trim() || undefined, currentClass: form.currentClass.trim() || undefined,
        gender: form.gender.trim() || undefined, dateOfBirth: form.dateOfBirth || undefined, addressLine1: form.addressLine1.trim() || undefined,
        city: form.city.trim() || undefined, state: form.state.trim() || undefined, country: form.country.trim() || undefined, postalCode: form.postalCode.trim() || undefined,
        isOrphan: form.isOrphan, isNeedy: form.isNeedy, notes: form.notes.trim() || undefined,
      });
      navigation.goBack();
    } catch { Alert.alert('Error', 'Failed to update student.'); }
  };

  if (isLoading || !student) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color={colors.slate700} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Student</Text><View style={{ width: 40 }} />
        </View>
        <View style={styles.loading}><ActivityIndicator color={colors.primary600} /><Text style={styles.loadingText}>Loading...</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color={colors.slate700} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Student</Text><View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}><Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputGroup}><Text style={styles.label}>First Name *</Text><TextInput style={styles.input} value={form.firstName} onChangeText={(v) => update('firstName', v)} placeholder="First name" placeholderTextColor={colors.slate300} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Last Name</Text><TextInput style={styles.input} value={form.lastName} onChangeText={(v) => update('lastName', v)} placeholder="Last name" placeholderTextColor={colors.slate300} /></View>
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Gender</Text><TextInput style={styles.input} value={form.gender} onChangeText={(v) => update('gender', v)} placeholder="Male/Female" placeholderTextColor={colors.slate300} /></View>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>DOB</Text><TextInput style={styles.input} value={form.dateOfBirth} onChangeText={(v) => update('dateOfBirth', v)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.slate300} /></View>
          </View>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.inputGroup}><Text style={styles.label}>Phone</Text><TextInput style={styles.input} value={form.phone} onChangeText={(v) => update('phone', v)} placeholder="Phone" keyboardType="phone-pad" placeholderTextColor={colors.slate300} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Email</Text><TextInput style={styles.input} value={form.email} onChangeText={(v) => update('email', v)} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.slate300} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Address</Text><TextInput style={styles.input} value={form.addressLine1} onChangeText={(v) => update('addressLine1', v)} placeholder="Street" placeholderTextColor={colors.slate300} /></View>
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>City</Text><TextInput style={styles.input} value={form.city} onChangeText={(v) => update('city', v)} placeholder="City" placeholderTextColor={colors.slate300} /></View>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>State</Text><TextInput style={styles.input} value={form.state} onChangeText={(v) => update('state', v)} placeholder="State" placeholderTextColor={colors.slate300} /></View>
          </View>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Academic Details</Text>
          <View style={styles.inputGroup}><Text style={styles.label}>Branch ID</Text><TextInput style={styles.input} value={form.branchId} onChangeText={(v) => update('branchId', v)} placeholder="Branch UUID" placeholderTextColor={colors.slate300} /></View>
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Program</Text><TextInput style={styles.input} value={form.currentProgram} onChangeText={(v) => update('currentProgram', v)} placeholder="Program" placeholderTextColor={colors.slate300} /></View>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>Class</Text><TextInput style={styles.input} value={form.currentClass} onChangeText={(v) => update('currentClass', v)} placeholder="Class" placeholderTextColor={colors.slate300} /></View>
          </View>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Flags</Text>
          <View style={styles.flagRow}><Text style={styles.flagLabel}>Orphan</Text><Switch value={form.isOrphan} onValueChange={(v) => update('isOrphan', v)} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={form.isOrphan ? colors.primary600 : colors.slate400} /></View>
          <View style={styles.flagRow}><Text style={styles.flagLabel}>Needy</Text><Switch value={form.isNeedy} onValueChange={(v) => update('isNeedy', v)} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={form.isNeedy ? colors.primary600 : colors.slate400} /></View>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Notes</Text>
          <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={form.notes} onChangeText={(v) => update('notes', v)} placeholder="Notes..." multiline numberOfLines={4} placeholderTextColor={colors.slate300} />
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Save Changes</Text>}
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['3'] },
  loadingText: { ...typography.body, color: colors.slate400 },
  scroll: { paddingHorizontal: spacing['4'], paddingBottom: spacing['6'], gap: spacing['5'] },
  section: { gap: spacing['3'] },
  sectionTitle: { ...typography.heading, color: colors.slate900 },
  inputGroup: { gap: spacing['1.5'] },
  label: { ...typography.smallBold, color: colors.slate600 },
  input: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate200, paddingHorizontal: spacing['4'], paddingVertical: spacing['3'], ...typography.small, color: colors.slate900 },
  rowInputs: { flexDirection: 'row', gap: spacing['3'] },
  flagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radius.xl, paddingHorizontal: spacing['4'], paddingVertical: spacing['3'], borderWidth: 1, borderColor: colors.slate200 },
  flagLabel: { ...typography.small, color: colors.slate800 },
  submitBtn: { backgroundColor: colors.primary600, borderRadius: radius.xl, paddingVertical: spacing['4'], alignItems: 'center', marginTop: spacing['4'] },
  submitText: { ...typography.heading, color: colors.white, fontSize: 16 },
});
