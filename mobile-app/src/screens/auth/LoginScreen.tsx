import React, { useState } from 'react';
import { Alert, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, typography } from '@/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.isLoading);

  const onSubmit = async () => {
    try {
      await login(email.trim(), password);
    } catch {
      Alert.alert('Login failed', 'Please check your credentials and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Pressable onPress={() => navigation.navigate('Landing')} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={16} color={colors.slate500} />
        <Text style={styles.backText}>Back to Home</Text>
      </Pressable>

      {/* Remove standalone Kalma — now shown on image */}

      {/* Premium Hero Image Section */}
      <View style={styles.heroBanner}>
        <ImageBackground
          source={require('../../../assets/image.png')}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          {/* Dark gradient overlay */}
          <View style={styles.heroOverlay}>
            {/* Top decorative row */}
            <View style={styles.heroTopRow}>
              <View style={styles.heroDot} />
              <Text style={styles.heroBadge}>✦ بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ ✦</Text>
              <View style={styles.heroDot} />
            </View>
            {/* Kalma on image */}
            <Text style={styles.heroKalma}>لَا إِلٰهَ إِلَّا ٱلله</Text>
            <Text style={styles.heroKalma2}>مُحَمَّدٌ رَسُولُ ٱلله</Text>
            {/* Bottom label */}
            <View style={styles.heroBottomRow}>
              <View style={styles.goldLine} />
              <Text style={styles.heroLabel}>IdaraSys — Madarsa Management</Text>
              <View style={styles.goldLine} />
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.headerWrap}>
        <Text style={styles.title}>Welcome <Text style={{ color: colors.primary600 }}>Back</Text></Text>
        <Text style={styles.subtitle}>Sign in to manage your institution's operations.</Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={colors.slate400} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="admin@madarsa.org"
              placeholderTextColor={colors.slate400}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.slate400} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.slate400}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={[styles.input, { flex: 1 }]}
            />
            <Pressable onPress={() => setShowPassword((p) => !p)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.slate400} />
            </Pressable>
          </View>
        </View>

        <View style={styles.row}>
          <Pressable style={styles.remember} onPress={() => setRemember((p) => !p)}>
            <View style={[styles.check, remember && styles.checked]} />
            <Text style={styles.rememberText}>Remember me</Text>
          </Pressable>
          <Text style={styles.forgot}>Forgot password?</Text>
        </View>

        <Button title="Sign in to Dashboard" onPress={onSubmit} loading={loading} />
      </Card>

      <View style={styles.bottomWrap}>
        <Text style={styles.bottomText}>Don't have an institution registered?</Text>
        <Button title="Setup your Institution" variant="outline" onPress={() => navigation.navigate('Register')} style={styles.bottomBtn} />
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
  kalma: { textAlign: 'center', ...typography.body, marginBottom: spacing.xl },
  headerWrap: { alignItems: 'center', marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.slate900, textAlign: 'center' },
  subtitle: { ...typography.bodyLg, color: colors.slate500, textAlign: 'center', marginTop: spacing.sm, maxWidth: 320 },
  formCard: { padding: spacing.lg, gap: spacing.md, borderRadius: 28 },
  fieldWrap: { gap: spacing.xs },
  label: { ...typography.body, color: colors.slate600, fontWeight: '800' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gray50,
    borderWidth: 2,
    borderColor: colors.slate100,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 54,
  },
  input: { ...typography.body, color: colors.slate900, fontWeight: '700', flex: 1, paddingVertical: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  remember: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  check: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: colors.slate300, backgroundColor: colors.white },
  checked: { backgroundColor: colors.primary600, borderColor: colors.primary600 },
  rememberText: { ...typography.small, color: colors.slate600, fontWeight: '700' },
  forgot: { ...typography.small, color: colors.primary600, fontWeight: '800' },
  bottomWrap: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
  bottomText: { ...typography.body, color: colors.slate500, textAlign: 'center' },
  bottomBtn: { width: '100%' },

  // Premium hero banner
  heroBanner: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#c4a44a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#c4a44a55',
  },
  heroImage: {
    width: '100%',
    height: 210,
  },
  heroImageStyle: {
    borderRadius: 22,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 30, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing['1'],
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['2'],
  },
  heroDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#c4a44a',
  },
  heroBadge: {
    fontSize: 10,
    color: '#c4a44a',
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  heroKalma: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(196,164,74,0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    letterSpacing: 0.5,
  },
  heroKalma2: {
    fontSize: 22,
    color: '#e8d5a0',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing['3'],
    textShadowColor: 'rgba(196,164,74,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  goldLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#c4a44a88',
  },
  heroLabel: {
    fontSize: 10,
    color: '#c4a44a',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
