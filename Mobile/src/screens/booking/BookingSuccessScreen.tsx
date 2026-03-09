// src/screens/booking/BookingSuccessScreen.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import Colors from '../../contants/colors';

const { width } = Dimensions.get('window');
const theme = Colors.light;

// ─── Animated Checkmark Ring ──────────────────────────────────────────────────
const SuccessRing: React.FC = () => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const innerScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(innerScale, { toValue: 1, useNativeDriver: true, tension: 70, friction: 6 }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={[ring.outer, { transform: [{ scale }], opacity }]}>
      <Animated.View style={[ring.inner, { transform: [{ scale: innerScale }] }]}>
        <Animated.Text style={[ring.check, { opacity: checkOpacity }]}>✓</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

const ring = StyleSheet.create({
  outer: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(25,82,166,0.10)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  inner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  check: { fontSize: 36, color: '#fff', fontWeight: '900' },
});

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
  );
};

// ─── Detail Row ───────────────────────────────────────────────────────────────
const DetailRow: React.FC<{ emoji: string; label: string; value: string }> = ({ emoji, label, value }) => (
  <View style={dr.row}>
    <View style={dr.iconWrap}>
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={dr.label}>{label}</Text>
      <Text style={dr.value}>{value}</Text>
    </View>
  </View>
);

const dr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 11, fontWeight: '600', color: theme.textSecondary, letterSpacing: 0.6, marginBottom: 2 },
  value: { fontSize: 15, fontWeight: '700', color: theme.textPrimary },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
interface BookingSuccessScreenProps {
  navigation?: any;
  route?: any;
}

const BookingSuccessScreen: React.FC<BookingSuccessScreenProps> = ({ navigation, route }) => {
  const booking = route?.params?.booking;
  const service = booking?.service?.name ?? 'Hair Styling';
  const duration = booking?.service?.duration ?? '60 min';
  const price = booking?.service?.price ?? '$65';
  const stylist = booking?.stylist?.name ?? 'Ava Chen';
  const time = booking?.time ?? '10:30 AM';
  const rawDate = booking?.date;
  const formattedDate = rawDate
    ? new Date(rawDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : 'Tuesday, March 3';

  const dots = [
    { top: 60, left: 30, size: 10, color: theme.primary, opacity: 0.5, delay: 300 },
    { top: 90, left: width - 50, size: 7, color: theme.lavenderLight, opacity: 0.8, delay: 400 },
    { top: 160, left: 20, size: 6, color: '#BDC2DB', opacity: 0.6, delay: 500 },
    { top: 180, left: width - 35, size: 12, color: theme.primary, opacity: 0.18, delay: 350 },
    { top: 40, left: width / 2 - 10, size: 5, color: theme.primary, opacity: 0.4, delay: 600 },
  ];

  return (
    <View style={ss.container}>
      <StatusBar barStyle="dark-content" />
      <View style={ss.accentBar} />

      {/* Decorative dots rendered outside scroll so they stay fixed */}
      {dots.map((d, i) => (
        <FadeIn key={i} delay={d.delay}>
          <View style={[ss.dot, {
            top: d.top, left: d.left,
            width: d.size, height: d.size,
            borderRadius: d.size / 2,
            backgroundColor: d.color,
            opacity: d.opacity,
          }]} />
        </FadeIn>
      ))}

      <ScrollView
        contentContainerStyle={ss.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SuccessRing />

        <FadeIn delay={400}>
          <Text style={ss.title}>Booking Confirmed!</Text>
        </FadeIn>

        <FadeIn delay={500}>
          <Text style={ss.subtitle}>
            You're all set. We'll send a reminder{'\n'}24 hours before your appointment.
          </Text>
        </FadeIn>

        <FadeIn delay={620}>
          <View style={ss.card}>
            <View style={ss.cardHeader}>
              <View style={ss.cardBadge}>
                <Text style={ss.cardBadgeText}>CONFIRMED</Text>
              </View>
              <Text style={ss.cardPrice}>{price}</Text>
            </View>
            <View style={ss.divider} />
            <DetailRow emoji="✂️" label="SERVICE" value={service} />
            <View style={ss.hairDivider} />
            <DetailRow emoji="🧑‍🎨" label="STYLIST" value={stylist} />
            <View style={ss.hairDivider} />
            <DetailRow emoji="📅" label="DATE" value={formattedDate} />
            <View style={ss.hairDivider} />
            <DetailRow emoji="🕐" label="TIME" value={`${time} · ${duration}`} />
          </View>
        </FadeIn>

        <FadeIn delay={760}>
          <TouchableOpacity
            style={ss.primaryBtn}
            onPress={() => navigation?.navigate('MyBookings')}
            activeOpacity={0.85}
          >
            <Text style={ss.primaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>
        </FadeIn>

        <FadeIn delay={840}>
          <TouchableOpacity
            style={ss.secondaryBtn}
            onPress={() => navigation?.navigate('Home')}
            activeOpacity={0.7}
          >
            <Text style={ss.secondaryBtnText}>← Back to Home</Text>
          </TouchableOpacity>
        </FadeIn>
      </ScrollView>
    </View>
  );
};

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  accentBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 4, backgroundColor: theme.primary,
  },
  dot: { position: 'absolute' },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 56 : 40,
  },
  title: {
    fontSize: 30, fontWeight: '800', color: theme.textPrimary,
    letterSpacing: -0.5, textAlign: 'center', marginBottom: 10,
  },
  subtitle: {
    fontSize: 14, color: theme.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },
  card: {
    width: width - 48,
    backgroundColor: theme.card,
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: theme.lavenderLight,
    shadowColor: '#000', shadowOpacity: 0.07,
    shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
    elevation: 4, marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  cardBadge: {
    backgroundColor: 'rgba(25,82,166,0.1)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  cardBadgeText: {
    fontSize: 11, fontWeight: '800', color: theme.primary, letterSpacing: 1.2,
  },
  cardPrice: { fontSize: 22, fontWeight: '800', color: theme.primary },
  divider: { height: 1, backgroundColor: theme.lavenderLight, marginBottom: 4 },
  hairDivider: { height: 1, backgroundColor: theme.border, marginHorizontal: 4 },
  primaryBtn: {
    width: width - 48,
    backgroundColor: theme.primary,
    borderRadius: 16, paddingVertical: 18,
    alignItems: 'center',
    shadowColor: theme.primary, shadowOpacity: 0.38,
    shadowRadius: 14, shadowOffset: { width: 0, height: 5 },
    elevation: 6, marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },
  secondaryBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  secondaryBtnText: { color: theme.textSecondary, fontWeight: '600', fontSize: 15 },
});

export default BookingSuccessScreen;