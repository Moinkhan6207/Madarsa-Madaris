import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { useCreateStudent } from '@/modules/students/hooks';
import { useBranches, useSessions } from '@/modules/students/utils/reference';
import type { StudentsStackParamList } from '@/navigation/types';
import type { GuardianInput } from '@/modules/students/types';

type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

const PROGRAM_OPTIONS = ['Hifz', 'Nazra', 'Hybrid'];
const GENDER_OPTIONS = ['male', 'female', 'other'];
const RELATIONS = ['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'UNCLE', 'AUNT', 'GRANDPARENT', 'SPOUSE', 'OTHER'] as const;

const toDateTime = (value: string) => (value ? new Date(`${value.replace(/[\/\.]/g, '-')}T00:00:00.000Z`).toISOString() : undefined);

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  multiline?: boolean;
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.notesInput]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      placeholderTextColor={colors.slate300}
      multiline={multiline}
    />
  </View>
);

export default function StudentCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const createMutation = useCreateStudent();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    arabicName: '',
    phone: '',
    email: '',
    identityNumber: '',
    branchId: '',
    academicSessionId: '',
    rollNumber: '',
    currentProgram: '',
    currentClass: '',
    currentSection: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    admissionDate: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isOrphan: false,
    isNeedy: false,
    notes: '',
  });
  const [guardians, setGuardians] = useState<GuardianInput[]>([]);

  const primaryGuardianCount = useMemo(
    () => guardians.filter((guardian) => guardian.isPrimary).length,
    [guardians]
  );

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const addGuardian = () =>
    setGuardians((current) => [
      ...current,
      { relation: 'FATHER', fullName: '', phone: '', isPrimary: current.length === 0 },
    ]);

  const updateGuardian = (index: number, patch: Partial<GuardianInput>) =>
    setGuardians((current) =>
      current.map((guardian, currentIndex) => {
        if (currentIndex !== index) {
          if (patch.isPrimary) {
            return { ...guardian, isPrimary: false };
          }
          return guardian;
        }

        return { ...guardian, ...patch };
      })
    );

  const removeGuardian = (index: number) =>
    setGuardians((current) => current.filter((_, currentIndex) => currentIndex !== index));

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required.';
    if (!form.branchId) return 'Please select a branch.';
    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) return 'Phone number is invalid.';
    const dobStr = form.dateOfBirth.trim().replace(/[\/\.]/g, '-');
    if (dobStr && (!/^\d{4}-\d{2}-\d{2}$/.test(dobStr) || Number.isNaN(Date.parse(`${dobStr}T00:00:00.000Z`)))) {
      return 'Date of birth must be YYYY-MM-DD.';
    }

    const admissionStr = form.admissionDate.trim().replace(/[\/\.]/g, '-');
    if (admissionStr && (!/^\d{4}-\d{2}-\d{2}$/.test(admissionStr) || Number.isNaN(Date.parse(`${admissionStr}T00:00:00.000Z`)))) {
      return 'Joining date must be YYYY-MM-DD.';
    }
    if (primaryGuardianCount > 1) return 'Only one primary guardian is allowed.';

    const invalidGuardian = guardians.find(
      (guardian) => guardian.fullName?.trim() || guardian.phone?.trim()
        ? !guardian.fullName?.trim() || !guardian.phone?.trim()
        : false
    );

    if (invalidGuardian) return 'Each guardian needs both name and phone.';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation error', error);
      return;
    }

    try {
      await createMutation.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        arabicName: form.arabicName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        branchId: form.branchId,
        academicSessionId: form.academicSessionId || undefined,
        rollNumber: form.rollNumber.trim() || undefined,
        currentProgram: form.currentProgram || undefined,
        currentClass: form.currentClass.trim() || undefined,
        currentSection: form.currentSection.trim() || undefined,
        gender: form.gender || undefined,
        dateOfBirth: toDateTime(form.dateOfBirth),
        bloodGroup: form.bloodGroup.trim() || undefined,
        admissionDate: toDateTime(form.admissionDate),
        identityNumber: form.identityNumber.trim() || undefined,
        addressLine1: form.addressLine1.trim() || undefined,
        addressLine2: form.addressLine2.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        country: form.country.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        isOrphan: form.isOrphan,
        isNeedy: form.isNeedy,
        notes: form.notes.trim() || undefined,
        guardians: guardians
          .filter((guardian) => guardian.fullName?.trim() && guardian.phone?.trim())
          .map((guardian) => ({
            ...guardian,
            fullName: guardian.fullName.trim(),
            phone: guardian.phone.trim(),
            email: guardian.email?.trim() || undefined,
            notes: guardian.notes?.trim() || undefined,
          })),
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error?.message || 'Failed to create student.');
    }
  };



  if (branchesLoading || sessionsLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary600} />
          <Text style={styles.loadingText}>Loading reference data...</Text>
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
        <Text style={styles.headerTitle}>Add Student</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Input label="First Name *" value={form.firstName} onChangeText={(value) => update('firstName', value)} placeholder="First name" autoCapitalize="words" />
          <Input label="Last Name" value={form.lastName} onChangeText={(value) => update('lastName', value)} placeholder="Last name" autoCapitalize="words" />
          <Input label="Arabic / Urdu Name" value={form.arabicName} onChangeText={(value) => update('arabicName', value)} placeholder="Optional Arabic/Urdu name" autoCapitalize="words" />
          <Input label="Roll Number" value={form.rollNumber} onChangeText={(value) => update('rollNumber', value)} placeholder="Optional roll number" autoCapitalize="words" />
          <Input label="Date of Birth" value={form.dateOfBirth} onChangeText={(value) => update('dateOfBirth', value)} placeholder="YYYY-MM-DD" />
          <Input label="Blood Group" value={form.bloodGroup} onChangeText={(value) => update('bloodGroup', value)} placeholder="e.g. O+, A-" autoCapitalize="characters" />
          <Input label="Joining Date" value={form.admissionDate} onChangeText={(value) => update('admissionDate', value)} placeholder="YYYY-MM-DD" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Branch & Academic</Text>
          <Text style={styles.label}>Branch *</Text>
          <View style={styles.chipWrap}>
            {branches.map((branch) => (
              <TouchableOpacity
                key={branch.id}
                style={[styles.chip, form.branchId === branch.id && styles.chipActive]}
                onPress={() => update('branchId', branch.id)}
              >
                <Text style={[styles.chipText, form.branchId === branch.id && styles.chipTextActive]}>{branch.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Academic Session</Text>
          <View style={styles.chipWrap}>
            {sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[styles.chip, form.academicSessionId === session.id && styles.chipActive]}
                onPress={() => update('academicSessionId', form.academicSessionId === session.id ? '' : session.id)}
              >
                <Text style={[styles.chipText, form.academicSessionId === session.id && styles.chipTextActive]}>
                  {session.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Program</Text>
          <View style={styles.chipWrap}>
            {PROGRAM_OPTIONS.map((program) => (
              <TouchableOpacity
                key={program}
                style={[styles.chip, form.currentProgram === program && styles.chipActive]}
                onPress={() => update('currentProgram', form.currentProgram === program ? '' : program)}
              >
                <Text style={[styles.chipText, form.currentProgram === program && styles.chipTextActive]}>
                  {program}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Class" value={form.currentClass} onChangeText={(value) => update('currentClass', value)} placeholder="Class" />
          <Input label="Section" value={form.currentSection} onChangeText={(value) => update('currentSection', value)} placeholder="Section (e.g. A, B)" />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipWrap}>
            {GENDER_OPTIONS.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[styles.chip, form.gender === gender && styles.chipActive]}
                onPress={() => update('gender', form.gender === gender ? '' : gender)}
              >
                <Text style={[styles.chipText, form.gender === gender && styles.chipTextActive]}>{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Identity</Text>
          <Input label="Phone" value={form.phone} onChangeText={(value) => update('phone', value)} placeholder="Phone number" keyboardType="phone-pad" />
          <Input label="Email" value={form.email} onChangeText={(value) => update('email', value)} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Identity (Aadhaar/ID)" value={form.identityNumber} onChangeText={(value) => update('identityNumber', value)} placeholder="Optional ID number" />
          <Input label="Address Line 1" value={form.addressLine1} onChangeText={(value) => update('addressLine1', value)} placeholder="Street address" />
          <Input label="Address Line 2" value={form.addressLine2} onChangeText={(value) => update('addressLine2', value)} placeholder="Area / landmark" />
          <Input label="City" value={form.city} onChangeText={(value) => update('city', value)} placeholder="City" />
          <Input label="State" value={form.state} onChangeText={(value) => update('state', value)} placeholder="State" />
          <Input label="Country" value={form.country} onChangeText={(value) => update('country', value)} placeholder="Country" />
          <Input label="Postal Code" value={form.postalCode} onChangeText={(value) => update('postalCode', value)} placeholder="Postal code" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flags</Text>
          <View style={styles.flagRow}>
            <Text style={styles.flagLabel}>Orphan</Text>
            <Switch value={form.isOrphan} onValueChange={(value) => update('isOrphan', value)} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={form.isOrphan ? colors.primary600 : colors.slate400} />
          </View>
          <View style={styles.flagRow}>
            <Text style={styles.flagLabel}>Needy</Text>
            <Switch value={form.isNeedy} onValueChange={(value) => update('isNeedy', value)} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={form.isNeedy ? colors.primary600 : colors.slate400} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Guardians</Text>
            <TouchableOpacity onPress={addGuardian} style={styles.addBtn}>
              <Ionicons name="add" size={18} color={colors.primary600} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {guardians.map((guardian, index) => (
            <View key={`${guardian.relation}-${index}`} style={styles.guardianCard}>
              <Text style={styles.label}>Relation</Text>
              <View style={styles.chipWrap}>
                {RELATIONS.map((relation) => (
                  <TouchableOpacity
                    key={relation}
                    style={[styles.chip, guardian.relation === relation && styles.chipActive]}
                    onPress={() => updateGuardian(index, { relation })}
                  >
                    <Text style={[styles.chipText, guardian.relation === relation && styles.chipTextActive]}>{relation}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input label="Full Name" value={guardian.fullName} onChangeText={(value) => updateGuardian(index, { fullName: value })} placeholder="Guardian name" autoCapitalize="words" />
              <Input label="Phone" value={guardian.phone} onChangeText={(value) => updateGuardian(index, { phone: value })} placeholder="Guardian phone" keyboardType="phone-pad" />
              <View style={styles.flagRow}>
                <Text style={styles.flagLabel}>Primary Guardian</Text>
                <Switch value={guardian.isPrimary ?? false} onValueChange={(value) => updateGuardian(index, { isPrimary: value })} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={guardian.isPrimary ? colors.primary600 : colors.slate400} />
              </View>
              <TouchableOpacity onPress={() => removeGuardian(index)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.red500} />
                <Text style={styles.removeText}>Remove guardian</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input label="Additional Notes" value={form.notes} onChangeText={(value) => update('notes', value)} placeholder="Anything important to capture" multiline />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={createMutation.isPending}>
          {createMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Create Student</Text>}
        </TouchableOpacity>
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
  scroll: { paddingHorizontal: spacing['4'], paddingBottom: spacing['8'], gap: spacing['5'] },
  section: { gap: spacing['3'] },
  sectionTitle: { ...typography.heading, color: colors.slate900 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputGroup: { gap: spacing['1.5'] },
  label: { ...typography.smallBold, color: colors.slate600 },
  input: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.slate200, paddingHorizontal: spacing['4'], paddingVertical: spacing['3'], ...typography.small, color: colors.slate900 },
  notesInput: { minHeight: 100, textAlignVertical: 'top' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  chip: { paddingHorizontal: spacing['3'], paddingVertical: spacing['2'], borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.slate200 },
  chipActive: { backgroundColor: colors.primary50, borderColor: colors.primary600 },
  chipText: { ...typography.xs, color: colors.slate600, fontWeight: '600' },
  chipTextActive: { color: colors.primary700, fontWeight: '800' },
  flagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radius.xl, paddingHorizontal: spacing['4'], paddingVertical: spacing['3'], borderWidth: 1, borderColor: colors.slate200 },
  flagLabel: { ...typography.small, color: colors.slate800 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'], backgroundColor: colors.primary50, paddingHorizontal: spacing['3'], paddingVertical: spacing['1.5'], borderRadius: radius.xl },
  addBtnText: { ...typography.smallBold, color: colors.primary600 },
  guardianCard: { backgroundColor: colors.white, borderRadius: radius['2xl'], borderWidth: 1, borderColor: colors.slate200, padding: spacing['4'], gap: spacing['3'] },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'], alignSelf: 'flex-start' },
  removeText: { ...typography.xsBold, color: colors.red500 },
  submitBtn: { backgroundColor: colors.primary600, borderRadius: radius.xl, paddingVertical: spacing['4'], alignItems: 'center', marginTop: spacing['3'] },
  submitText: { ...typography.heading, color: colors.white, fontSize: 16 },
});
