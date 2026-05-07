import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { colors, radius, spacing, typography } from '@/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { InstitutionType } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const institutionTypes: InstitutionType[] = [
  'SMALL_LOCAL_MADARSA',
  'RESIDENTIAL_MADARSA',
  'HYBRID_DEENI_SCHOOL',
  'TRUST_RUN_IDARA',
  'MASJID_MADARSA_COMBINED',
  'OTHER',
];

const labels: Record<InstitutionType, string> = {
  SMALL_LOCAL_MADARSA: 'Small Local Madarsa',
  RESIDENTIAL_MADARSA: 'Residential Madarsa',
  HYBRID_DEENI_SCHOOL: 'Deeni School / Hybrid',
  TRUST_RUN_IDARA: 'Trust Run Idara',
  MASJID_MADARSA_COMBINED: 'Masjid-Madarsa Combined',
  OTHER: 'Other',
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function RegisterScreen({ navigation }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [institutionType, setInstitutionType] = useState<InstitutionType>('OTHER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.isLoading);

  const previewSlug = useMemo(() => slug || toSlug(displayName), [slug, displayName]);

  const next = () => {
    if (!displayName || !previewSlug || previewSlug.length < 3) {
      Alert.alert('Validation', 'Please fill valid institution details.');
      return;
    }
    setStep(2);
  };

  const submit = async () => {
    if (!fullName || !email || password.length < 8) {
      Alert.alert('Validation', 'Please fill valid admin details.');
      return;
    }
    try {
      await register({
        displayName,
        slug: previewSlug,
        institutionType,
        adminUser: { fullName, email, password },
      });
    } catch (e: any) {
      Alert.alert('Registration failed', e?.message || 'Registration failed.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Pressable onPress={() => navigation.navigate('Landing')} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={16} color={colors.slate500} />
        <Text style={styles.backText}>Back to Home</Text>
      </Pressable>

      <View style={styles.headerWrap}>
        <Text style={styles.title}>Get <Text style={{ color: colors.primary600 }}>Started</Text></Text>
        <Text style={styles.subtitle}>Join 50+ institutions managing with Barakah.</Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={[styles.progress, step === 1 ? styles.progressActive : styles.progressMuted]} />
        <View style={[styles.progress, step === 2 ? styles.progressActive : styles.progressMuted]} />
      </View>

      <Card style={styles.formCard}>
        {step === 1 ? (
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <View style={styles.blockIcon}><Ionicons name="business-outline" size={18} color={colors.primary700} /></View>
              <View>
                <Text style={styles.blockTitle}>Institution Details</Text>
                <Text style={styles.blockSub}>Basic info about your Madarsa or Idara.</Text>
              </View>
            </View>

            <Text style={styles.label}>Institution Name</Text>
            <TextInput value={displayName} onChangeText={(v) => {
              setDisplayName(v);
              if (!slugManual) setSlug(toSlug(v));
            }} placeholder="e.g. Madarsa Darul Uloom" placeholderTextColor={colors.slate400} style={styles.input} />

            <Text style={styles.label}>Institution URL (Slug)</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="globe-outline" size={18} color={colors.slate400} />
              <TextInput value={slug} onChangeText={(v) => {
                setSlugManual(true);
                setSlug(toSlug(v));
              }} placeholder="darul-uloom" placeholderTextColor={colors.slate400} style={[styles.inputInner, { flex: 1 }]} />
            </View>
            <Text style={styles.preview}>Preview: /public/{previewSlug}</Text>

            <Text style={styles.label}>Institution Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {institutionTypes.map((type) => (
                <Pressable key={type} onPress={() => setInstitutionType(type)} style={[styles.typeChip, institutionType === type && styles.typeChipActive]}>
                  <Text style={[styles.typeText, institutionType === type && styles.typeTextActive]}>{labels[type]}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Button title="Continue to Admin Details" onPress={next} />
          </View>
        ) : (
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <View style={styles.blockIcon}><Ionicons name="person-add-outline" size={18} color={colors.primary700} /></View>
              <View>
                <Text style={styles.blockTitle}>Admin Account</Text>
                <Text style={styles.blockSub}>Setup primary admin for {displayName || 'institution'}.</Text>
              </View>
            </View>

            <Text style={styles.label}>Admin Full Name</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Maulana Zaid" placeholderTextColor={colors.slate400} style={styles.input} />

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={colors.slate400} />
              <TextInput value={email} onChangeText={setEmail} placeholder="admin@institution.org" placeholderTextColor={colors.slate400} keyboardType="email-address" autoCapitalize="none" style={[styles.inputInner, { flex: 1 }]} />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.slate400} />
              <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={colors.slate400} secureTextEntry={!showPassword} autoCapitalize="none" style={[styles.inputInner, { flex: 1 }]} />
              <Pressable onPress={() => setShowPassword((p) => !p)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.slate400} />
              </Pressable>
            </View>

            <View style={styles.footerBtns}>
              <Button title="Back" variant="outline" onPress={() => setStep(1)} style={{ flex: 1 }} />
              <Button title="Finish Registration" onPress={submit} loading={loading} style={{ flex: 2 }} />
            </View>
            <Text style={styles.secure}>Security verified by systems</Text>
          </View>
        )}
      </Card>

      <View style={styles.bottomWrap}>
        <Text style={styles.bottomText}>Already have an account?</Text>
        <Button title="Sign in to Account" variant="outline" onPress={() => navigation.navigate('Login')} style={styles.bottomBtn} />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  screen: { flex: 1, backgroundColor: colors.white },
  container: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  backText: { ...typography.small, color: colors.slate500, fontWeight: '800' },
  headerWrap: { marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.slate900 },
  subtitle: { ...typography.bodyLg, color: colors.slate500, marginTop: spacing.xs },
  progressWrap: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  progress: { flex: 1, height: 8, borderRadius: 999 },
  progressActive: { backgroundColor: colors.primary600 },
  progressMuted: { backgroundColor: colors.primary200, opacity: 0.5 },
  formCard: { borderRadius: 30, padding: spacing.lg },
  block: { gap: spacing.sm },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  blockIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary100, alignItems: 'center', justifyContent: 'center' },
  blockTitle: { ...typography.heading, color: colors.slate900 },
  blockSub: { ...typography.small, color: colors.slate500 },
  label: { ...typography.body, color: colors.slate600, fontWeight: '800' },
  input: {
    backgroundColor: colors.gray50,
    borderWidth: 2,
    borderColor: colors.slate100,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
    color: colors.slate900,
    ...typography.small,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gray50,
    borderWidth: 2,
    borderColor: colors.slate100,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  inputInner: { color: colors.slate900, ...typography.small, fontWeight: '700', paddingVertical: spacing.sm },
  preview: { ...typography.small, color: colors.slate400, marginTop: -2 },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
  },
  typeChipActive: { backgroundColor: colors.primary50, borderColor: colors.primary200 },
  typeText: { ...typography.small, color: colors.slate500, fontWeight: '700' },
  typeTextActive: { color: colors.primary700 },
  footerBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  secure: { ...typography.xsCaps, color: colors.slate400, textAlign: 'center', marginTop: spacing.xs },
  bottomWrap: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
  bottomText: { ...typography.body, color: colors.slate500 },
  bottomBtn: { width: '100%' },
});
