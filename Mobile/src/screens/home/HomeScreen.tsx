import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Colors from '../../contants/colors';

const { width } = Dimensions.get('window');

// ─── Animated Section Wrapper ────────────────────────────────────────────────
const FadeInView: React.FC<{ delay?: number; children: React.ReactNode }> = ({
  delay = 0,
  children,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

// ─── Service Pill ─────────────────────────────────────────────────────────────
const ServicePill: React.FC<{
  label: string;
  emoji: string;
  theme: typeof Colors.light;
}> = ({ label, emoji, theme }) => (
  <TouchableOpacity
    style={[styles.pill, { backgroundColor: theme.card, borderColor: theme.lavenderLight }]}
    activeOpacity={0.75}
  >
    <Text style={styles.pillEmoji}>{emoji}</Text>
    <Text style={[styles.pillLabel, { color: theme.textPrimary }]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Offer Card ───────────────────────────────────────────────────────────────
const OfferCard: React.FC<{
  title: string;
  subtitle: string;
  badge: string;
  accent: string;
  theme: typeof Colors.light;
}> = ({ title, subtitle, badge, accent, theme }) => (
  <TouchableOpacity activeOpacity={0.82} style={[styles.offerCard, { backgroundColor: accent }]}>
    <View style={styles.offerBadgeWrap}>
      <Text style={styles.offerBadge}>{badge}</Text>
    </View>
    <Text style={styles.offerTitle}>{title}</Text>
    <Text style={styles.offerSubtitle}>{subtitle}</Text>
    <View style={styles.offerCta}>
      <Text style={styles.offerCtaText}>Claim →</Text>
    </View>
  </TouchableOpacity>
);

// ─── Appointment Row ──────────────────────────────────────────────────────────
const AppointmentRow: React.FC<{
  service: string;
  stylist: string;
  time: string;
  theme: typeof Colors.light;
}> = ({ service, stylist, time, theme }) => (
  <View style={[styles.appointmentRow, { borderColor: theme.lavenderLight }]}>
    <View style={[styles.appointmentDot, { backgroundColor: theme.primary }]} />
    <View style={{ flex: 1 }}>
      <Text style={[styles.appointmentService, { color: theme.textPrimary }]}>{service}</Text>
      <Text style={[styles.appointmentMeta, { color: theme.textSecondary }]}>with {stylist}</Text>
    </View>
    <Text style={[styles.appointmentTime, { color: theme.primary }]}>{time}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const HomeScreen: React.FC = () => {
  const theme = Colors.light;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <View style={[styles.hero, { backgroundColor: theme.navyDark }]}>
          {/* Decorative circles */}
          <View style={styles.heroBubble1} />
          <View style={styles.heroBubble2} />

          <FadeInView delay={0}>
            <Text style={styles.heroGreeting}>Good morning, Sarah ✨</Text>
            <Text style={styles.heroHeadline}>
              Your next{'\n'}
              <Text style={{ color: '#BDC2DB' }}>appointment</Text>
            </Text>
          </FadeInView>

          {/* Next appointment card */}
          <FadeInView delay={120}>
            <View style={styles.nextCard}>
              <View style={styles.nextCardLeft}>
                <Text style={[styles.nextCardLabel, { color: theme.textSecondary }]}>
                  TOMORROW
                </Text>
                <Text style={[styles.nextCardService, { color: theme.textPrimary }]}>
                  Balayage + Cut
                </Text>
                <Text style={[styles.nextCardMeta, { color: theme.textSecondary }]}>
                  with Ava Chen · 2h 30m
                </Text>
              </View>
              <View style={[styles.nextCardTime, { backgroundColor: theme.primary }]}>
                <Text style={styles.nextCardTimeHour}>10</Text>
                <Text style={styles.nextCardTimeMin}>:30</Text>
                <Text style={styles.nextCardTimeAmPm}>AM</Text>
              </View>
            </View>
          </FadeInView>
        </View>

        {/* ── Quick Book ───────────────────────────────────────────── */}
        <FadeInView delay={200}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Book a Service
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillRow}
            >
              <ServicePill label="Haircut" emoji="✂️" theme={theme} />
              <ServicePill label="Color" emoji="🎨" theme={theme} />
              <ServicePill label="Blowout" emoji="💨" theme={theme} />
              <ServicePill label="Nails" emoji="💅" theme={theme} />
              <ServicePill label="Facial" emoji="🌿" theme={theme} />
              <ServicePill label="Massage" emoji="🤲" theme={theme} />
            </ScrollView>
            <TouchableOpacity
              style={[styles.bookBtn, { backgroundColor: theme.primary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.bookBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </FadeInView>

        {/* ── Special Offers ───────────────────────────────────────── */}
        <FadeInView delay={320}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Special Offers
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              <OfferCard
                title="First Visit"
                subtitle="20% off any service"
                badge="NEW"
                accent="#1952A6"
                theme={theme}
              />
              <OfferCard
                title="Refer a Friend"
                subtitle="Both get R15 credit"
                badge="SHARE"
                accent="#22274C"
                theme={theme}
              />
              <OfferCard
                title="Monday Magic"
                subtitle="Blowouts at R35"
                badge="MON"
                accent="#2E3F74"
                theme={theme}
              />
            </ScrollView>
          </View>
        </FadeInView>

        {/* ── Upcoming Appointments ────────────────────────────────── */}
        <FadeInView delay={440}>
          <View style={[styles.section, styles.sectionLast]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Upcoming
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: theme.primary }]}>Manage</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.upcomingCard, { backgroundColor: theme.card }]}>
              <AppointmentRow
                service="Balayage + Cut"
                stylist="Ava Chen"
                time="Tue 10:30"
                theme={theme}
              />
              <AppointmentRow
                service="Gel Manicure"
                stylist="Mia Torres"
                time="Thu 2:00"
                theme={theme}
              />
              <AppointmentRow
                service="Deep Conditioning"
                stylist="James Liu"
                time="Sat 11:00"
                theme={theme}
              />
            </View>
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },

  // Hero
  hero: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 36,
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBubble1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(25,82,166,0.35)',
    top: -60,
    right: -60,
  },
  heroBubble2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(189,194,219,0.1)',
    bottom: 20,
    left: -30,
  },
  heroGreeting: {
    fontSize: 14,
    color: '#BDC2DB',
    letterSpacing: 0.4,
    marginBottom: 8,
    fontWeight: '500',
  },
  heroHeadline: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 42,
    marginBottom: 28,
    letterSpacing: -0.5,
  },

  // Next card
  nextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  nextCardLeft: { flex: 1, marginRight: 12 },
  nextCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  nextCardService: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  nextCardMeta: { fontSize: 13 },
  nextCardTime: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nextCardTimeHour: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  nextCardTimeMin: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  nextCardTimeAmPm: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Sections
  section: { paddingHorizontal: 24, paddingTop: 28 },
  sectionLast: { paddingBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, marginBottom: 16 },
  seeAll: { fontSize: 14, fontWeight: '600' },

  // Service Pills
  pillRow: { gap: 10, paddingBottom: 4, paddingRight: 24 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1,
  },
  pillEmoji: { fontSize: 16 },
  pillLabel: { fontSize: 14, fontWeight: '600' },

  // Book Button
  bookBtn: {
    marginTop: 18,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1952A6',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  bookBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },

  // Offer Cards
  offerCard: {
    width: width * 0.56,
    borderRadius: 16,
    padding: 18,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  offerBadgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
  },
  offerBadge: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  offerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  offerSubtitle: { color: 'rgba(255,255,255,0.72)', fontSize: 13, flex: 1 },
  offerCta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
  },
  offerCtaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, paddingBottom: 2 },

  // Upcoming
  upcomingCard: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  appointmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  appointmentService: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  appointmentMeta: { fontSize: 13 },
  appointmentTime: { fontSize: 13, fontWeight: '700' },
});

export default HomeScreen;