import React, { useEffect, useState } from 'react';
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
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import { useStudent, useUpdateStudent } from '@/modules/students/hooks';
import { useBranches, useSessions } from '@/modules/students/utils/reference';
import type { StudentsStackParamList } from '@/navigation/types';

type RouteProps = RouteProp<StudentsStackParamList, 'StudentEdit'>;
type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

const PROGRAM_OPTIONS = ['Hifz', 'Nazra', 'Hybrid'];
const GENDER_OPTIONS = ['male', 'female', 'other'];
const toDateTime = (value: string) => (value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined);

export default function StudentEditScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { studentId } = route.params;

  const { data: student, isLoading } = useStudent(studentId);
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const updateMutation = useUpdateStudent(studentId);

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

  useEffect(() => {
    if (!student) return;

    setForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      arabicName: student.arabicName || '',
      phone: student.phone || '',
      email: student.email || '',
      identityNumber: student.identityNumber || '',
      branchId: student.branchId || '',
      academicSessionId: student.academicSessionId || '',
      rollNumber: student.rollNumber || '',
      currentProgram: student.currentProgram || '',
      currentClass: student.currentClass || '',
      currentSection: student.currentSection || '',
      gender: student.gender || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0, 10) : '',
      bloodGroup: student.bloodGroup || '',
      admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().slice(0, 10) : '',
      addressLine1: student.addressLine1 || '',
      addressLine2: student.addressLine2 || '',
      city: student.city || '',
      state: student.state || '',
      country: student.country || '',
      postalCode: student.postalCode || '',
      isOrphan: student.isOrphan || false,
      isNeedy: student.isNeedy || false,
      notes: student.notes || '',
    });
  }, [student]);

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required.';
    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) return 'Phone number is invalid.';
    if (form.dateOfBirth && Number.isNaN(Date.parse(`${form.dateOfBirth}T00:00:00.000Z`))) return 'Date of birth must be YYYY-MM-DD.';
    if (form.admissionDate && Number.isNaN(Date.parse(`${form.admissionDate}T00:00:00.000Z`))) return 'Joining date must be YYYY-MM-DD.';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation error', error);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        arabicName: form.arabicName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        branchId: form.branchId || undefined,
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
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error?.message || 'Failed to update student.');
    }
  };

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
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    multiline?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.notesInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={colors.slate300}
        multiline={multiline}
      />
    </View>
  );

  if (isLoading || branchesLoading || sessionsLoading || !student) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary600} />
          <Text style={styles.loadingText}>Loading student...</Text>
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
        <Text style={styles.headerTitle}>Edit Student</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Input label="First Name *" value={form.firstName} onChangeText={(value) => update('firstName', value)} placeholder="First name" autoCapitalize="words" />
          <Input label="Last Name" value={form.lastName} onChangeText={(value) => update('lastName', value)} placeholder="Last name" autoCapitalize="words" />
          <Input label="Arabic / Urdu Name" value={form.arabicName} onChangeText={(value) => update('arabicName', value)} placeholder="Optional Arabic/Urdu name" autoCapitalize="words" />
          <Input label="Roll Number" value={form.rollNumber} onChangeText={(value) => update('rollNumber', value)} placeholder="Optional roll number" autoCapitalize="characters" />
          <Input label="Date of Birth" value={form.dateOfBirth} onChangeText={(value) => update('dateOfBirth', value)} placeholder="YYYY-MM-DD" />
          <Input label="Blood Group" value={form.bloodGroup} onChangeText={(value) => update('bloodGroup', value)} placeholder="e.g. O+, A-" autoCapitalize="characters" />
          <Input label="Joining Date" value={form.admissionDate} onChangeText={(value) => update('admissionDate', value)} placeholder="YYYY-MM-DD" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Branch & Academic</Text>
          <Text style={styles.label}>Branch</Text>
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
                <Text style={[styles.chipText, form.academicSessionId === session.id && styles.chipTextActive]}>{session.name}</Text>
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
                <Text style={[styles.chipText, form.currentProgram === program && styles.chipTextActive]}>{program}</Text>
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
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input label="Additional Notes" value={form.notes} onChangeText={(value) => update('notes', value)} placeholder="Anything important to capture" multiline />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>Save Changes</Text>}
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
  submitBtn: { backgroundColor: colors.primary600, borderRadius: radius.xl, paddingVertical: spacing['4'], alignItems: 'center', marginTop: spacing['3'] },
  submitText: { ...typography.heading, color: colors.white, fontSize: 16 },
});
