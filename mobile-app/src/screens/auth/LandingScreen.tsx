import React, { useRef, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { AuthStackParamList } from '@/navigation/types';
import { colors, radius, shadows, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

const features = [
  ['Student Management', 'Complete digital records for admissions, documents, and student history.'],
  ['Fee & Donation Tracking', 'Automated fee collection, receipt generation, and donation records.'],
  ['Attendance System', 'Daily tracking for students and staff with instant SMS alerts.'],
  ['Multi-Branch Support', 'Manage all your Madarsa branches from a single unified dashboard.'],
  ['Parent Communication', 'Seamlessly broadcast updates and academic reports to parents.'],
  ['Reports & Analytics', "Data-driven insights to help optimize your institution's operations."],
];

const benefits = [
  ['Save Time', 'Automate repetitive tasks like fee reminders and attendance.'],
  ['Reduce Manual Work', 'No more confusing spreadsheets or piles of paper registers.'],
  ['Centralized System', 'Access everything from one dashboard, anywhere, anytime.'],
  ['Secure Access', 'Role-based control to keep sensitive Madarsa data safe.'],
];

const steps = [
  ['Register your institution', 'Create an account for your Madarsa or Masjid with basic details.'],
  ['Setup profile & branches', 'Add your custom branding, configure multiple branches, and setup academic sessions.'],
  ['Start managing everything', 'Your dashboard is ready! Add students, collect fees, and manage operations digitally.'],
];

// Menu items matching web frontend
const menuItems = [
  { section: 'MAIN', items: [
    { icon: 'sparkles-outline', label: 'Features', action: 'features' },
    { icon: 'help-circle-outline', label: 'How It Works', action: 'howitworks' },
    { icon: 'heart-outline', label: 'Benefits', action: 'benefits' },
  ]},
  { section: 'ACCOUNT', items: [
    { icon: 'log-in-outline', label: 'Login', action: 'login' },
  ]},
];

export default function LandingScreen({ navigation }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<string, number>>({});

  const onSectionLayout = (section: string) => (event: any) => {
    const { y } = event.nativeEvent.layout;
    sectionPositions.current[section] = y;
  };

  const scrollToSection = (section: string) => {
    setMenuOpen(false);
    if (section === 'login') {
      navigation.navigate('Login');
      return;
    }
    if (section === 'register') {
      navigation.navigate('Register');
      return;
    }
    const y = sectionPositions.current[section];
    if (y !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: y - 20, animated: true });
    }
  };

  const insets = useSafeAreaInsets();

  const MenuDrawer = () => (
    <Modal
      visible={menuOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setMenuOpen(false)}
    >
      <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
        <View style={[styles.drawer, { paddingTop: Math.max(insets.top, 44) + spacing.lg }]}>
          {/* Menu Header */}
          <View style={styles.menuHeader}>
            <View style={styles.brandRow}>
              <View style={[styles.logoBox, { width: 40, height: 40 }]}>
                <Image source={{ uri: 'https://madarsa-saas.com/assets/makka_sharif.png' }} style={styles.logo} />
              </View>
              <Text style={styles.menuBrandText}>Menu</Text>
            </View>
            <TouchableOpacity onPress={() => setMenuOpen(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.slate500} />
            </TouchableOpacity>
          </View>

          {/* Kalma */}
          <Text style={styles.menuKalma}>لَا إِلٰهَ إِلَّا ٱلله مُحَمَّدٌ رَسُولُ ٱلله</Text>

          {/* Menu Sections */}
          {menuItems.map((section) => (
            <View key={section.section} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{section.section}</Text>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.action}
                  style={styles.menuItem}
                  onPress={() => scrollToSection(item.action)}
                >
                  <Ionicons name={item.icon as any} size={20} color={colors.slate600} />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Get Started Button */}
          <TouchableOpacity
            style={styles.menuCta}
            onPress={() => scrollToSection('register')}
          >
            <Ionicons name="rocket-outline" size={18} color={colors.primary600} />
            <Text style={styles.menuCtaText}>Get Started Free</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <MenuDrawer />
      <ScrollView ref={scrollViewRef} style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.navbar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Image source={{ uri: 'https://madarsa-saas.com/assets/makka_sharif.png' }} style={styles.logo} />
          </View>
          <Text style={styles.brandText}>Idara<Text style={styles.brandAccent}>Sys</Text></Text>
        </View>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
          <Ionicons name="menu-outline" size={28} color={colors.slate500} />
        </TouchableOpacity>
      </View>

      <Card style={styles.heroCard}>
        <Text style={styles.kalma}>لَا إِلٰهَ إِلَّا ٱلله مُحَمَّدٌ رَسُولُ ٱلله</Text>
        <Badge text="The #1 Management Platform" />
        <Text style={styles.heading}>Modern Management for</Text>
        <Text style={styles.headingAccent}>Madarsas & Idaras</Text>
        <Text style={styles.description}>
          Deeni aur duniyawi taleem ka mukammal nizam. Streamline admissions, fees, and operations all in one unified platform.
        </Text>
        <Button title="Get Started" onPress={() => navigation.navigate('Register')} />
        <Button title="Login" variant="outline" onPress={() => navigation.navigate('Login')} style={styles.loginBtn} />
        <Text style={styles.meta}>No credit card required</Text>
        <Text style={styles.meta}>Setup in 5 minutes</Text>
      </Card>

      <View style={styles.previewWrap}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80&auto=format&fit=crop' }} style={styles.previewImage} />
        <View style={styles.overlay}><Text style={styles.overlayTitle}>Centralized Madarsa Hub</Text><Text style={styles.overlaySub}>Manage everything with Barakah</Text></View>
      </View>

      <View style={styles.section} onLayout={onSectionLayout('features')}>
        <Text style={styles.sectionTitle}>Everything you need to manage your institution</Text>
        <Text style={styles.sectionSub}>Powerful tools designed specifically for the unique requirements of Madarsas, Maktabs, and Islamic Centers.</Text>
        <View style={styles.grid}>
          {features.map(([title, desc]) => (
            <Card key={title} style={styles.featureCard}>
              <View style={styles.featureIcon}><Ionicons name="sparkles-outline" size={20} color={colors.primary600} /></View>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.islamicSection} onLayout={onSectionLayout('howitworks')}>
        <View style={styles.heart}><Ionicons name="heart" size={26} color={colors.primary600} /></View>
        <Text style={styles.islamicTitle}>Built with pure intention for requirements of Madarsas & Maktabs</Text>
        <Text style={styles.islamicDesc}>We understand that Islamic institutions have different operational needs than standard schools. IdaraSys is crafted carefully to respect and digitalize these specific structures effectively.</Text>
      </View>

      <View style={styles.section} onLayout={onSectionLayout('benefits')}>
        <Text style={styles.sectionTitle}>Why transition to IdaraSys?</Text>
        <Text style={styles.sectionSub}>Embrace modern technology while maintaining traditional values. Our platform acts as a digital upgrade for your institution.</Text>
        {benefits.map(([title, desc]) => (
          <Card key={title} style={styles.benefitCard}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDesc}>{desc}</Text>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <Text style={styles.sectionSub}>Get your institution online and completely operational in three simple steps.</Text>
        {steps.map(([title, desc], idx) => (
          <View key={title} style={styles.stepRow}>
            <View style={styles.stepCircle}><Text style={styles.stepNum}>{idx + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Start managing your Madarsa digitally today</Text>
        <Text style={styles.ctaSub}>Join hundreds of institutions that have already upgraded to a smarter, faster, and more secure management system.</Text>
        <Button title="Create Free Account" variant="outline" onPress={() => navigation.navigate('Register')} style={styles.ctaBtnWhite} />
        <TouchableOpacity style={styles.ctaBtnDark}><Text style={styles.ctaDarkText}>Contact Sales</Text></TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.brandRow}>
          <View style={[styles.logoBox, { width: 32, height: 32, padding: 2 }]}><Image source={{ uri: 'https://madarsa-saas.com/assets/makka_sharif.png' }} style={styles.logo} /></View>
          <Text style={styles.footerBrand}>Idara<Text style={styles.brandAccent}>Sys</Text></Text>
        </View>
        <Text style={styles.footerText}>The complete, modern, and secure management platform built specifically for the needs of Madarsas, Masjids, and Islamic Institutions.</Text>
        <Text style={styles.copy}>© {new Date().getFullYear()} IdaraSys. All rights reserved.</Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  screen: { flex: 1, backgroundColor: colors.white },
  container: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing['3xl'] },
  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },

  // Drawer Menu Styles
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', flexDirection: 'row' },
  drawerSafeArea: { flex: 1, backgroundColor: colors.white, maxWidth: 280 },
  drawer: { width: 280, backgroundColor: colors.white, height: '100%', padding: spacing.lg },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  menuBrandText: { fontSize: 20, fontWeight: '800', color: colors.slate900 },
  closeBtn: { padding: spacing.xs },
  menuBtn: { padding: spacing.xs },
  menuKalma: { fontSize: 14, color: colors.primary700, textAlign: 'center', marginBottom: spacing.lg, fontWeight: '600' },
  menuSection: { marginBottom: spacing.lg },
  menuSectionTitle: { fontSize: 10, fontWeight: '900', color: colors.slate400, letterSpacing: 1.5, marginBottom: spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3], paddingHorizontal: spacing[2] },
  menuItemText: { fontSize: 16, fontWeight: '700', color: colors.slate700 },
  menuCta: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingVertical: spacing[3], paddingHorizontal: spacing[4], backgroundColor: colors.primary50, borderRadius: radius.lg, marginTop: spacing.md },
  menuCtaText: { fontSize: 16, fontWeight: '800', color: colors.primary600 },

  heroCard: { padding: spacing.lg, borderRadius: 30 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.slate900, borderWidth: 2, borderColor: colors.primary200, padding: 4, marginRight: spacing.sm },
  logo: { width: '100%', height: '100%', borderRadius: 8 },
  brandText: { fontSize: 44, fontWeight: '800', color: colors.slate900 },
  brandAccent: { color: colors.primary600, fontWeight: '900' },
  kalma: { ...typography.heading, color: colors.primary700, marginBottom: spacing.md },
  heading: { ...typography.h1, color: colors.slate900, marginTop: spacing.md },
  headingAccent: { ...typography.h1, color: colors.primary600, marginBottom: spacing.md },
  description: { ...typography.bodyLg, color: colors.slate700, marginBottom: spacing.lg },
  loginBtn: { marginTop: spacing.sm, marginBottom: spacing.lg },
  meta: { ...typography.small, color: colors.slate600, marginBottom: spacing.xs, fontWeight: '700' },
  previewWrap: { borderRadius: 24, overflow: 'hidden', borderWidth: 8, borderColor: colors.white, ...shadows.lg },
  previewImage: { width: '100%', height: 260 },
  overlay: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  overlayTitle: { color: colors.white, ...typography.heading },
  overlaySub: { color: '#e5e7eb', ...typography.small },
  section: { gap: spacing.sm, paddingVertical: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.slate900 },
  sectionSub: { ...typography.body, color: colors.slate500 },
  grid: { gap: spacing.sm },
  featureCard: { borderRadius: 20, gap: spacing.xs },
  featureIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary100, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { ...typography.heading, color: colors.slate900 },
  featureDesc: { ...typography.small, color: colors.slate600 },
  islamicSection: { backgroundColor: '#f8faf9', borderRadius: 20, padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  heart: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  islamicTitle: { ...typography.heading, color: colors.slate900, textAlign: 'center' },
  islamicDesc: { ...typography.small, color: colors.slate600, textAlign: 'center' },
  benefitCard: { borderRadius: 20, backgroundColor: '#f0fdf4', borderColor: colors.primary100 },
  stepRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginTop: spacing.sm },
  stepCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary50, alignItems: 'center', justifyContent: 'center' },
  stepNum: { ...typography.body, color: colors.slate900, fontWeight: '800' },
  cta: { backgroundColor: colors.primary600, borderRadius: 24, padding: spacing.lg, gap: spacing.sm, marginTop: spacing.md },
  ctaTitle: { ...typography.h3, color: colors.white, textAlign: 'center' },
  ctaSub: { ...typography.body, color: colors.primary100, textAlign: 'center' },
  ctaBtnWhite: { backgroundColor: colors.white, borderColor: colors.white },
  ctaBtnDark: { borderWidth: 1, borderColor: '#34d399', borderRadius: radius.xl, minHeight: 58, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(4,120,87,0.5)' },
  ctaDarkText: { ...typography.bodyLg, color: colors.white, fontWeight: '700' },
  footer: { borderTopWidth: 1, borderTopColor: colors.slate100, paddingTop: spacing.lg, gap: spacing.sm },
  footerBrand: { ...typography.heading, color: colors.slate900 },
  footerText: { ...typography.small, color: colors.slate500 },
  copy: { ...typography.small, color: colors.slate400, marginTop: spacing.sm },
});
