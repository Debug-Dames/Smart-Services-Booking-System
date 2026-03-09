// src/screens/booking/BookingScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import Colors from '../../contants/colors';

const { width } = Dimensions.get('window');
const theme = Colors.light;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  emoji: string;
  description: string;
}

interface Stylist {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  rating: string;
  color: string;
}

interface BookingState {
  service: Service | null;
  stylist: Stylist | null;
  date: string | null;
  time: string | null;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES: Service[] = [
  { id: '1', name: 'Haircut & Style', duration: '60 min', price: 'R65', emoji: '✂️', description: 'Cut, blow-dry & style' },
  { id: '2', name: 'Balayage', duration: '2h 30m', price: 'R180', emoji: '🎨', description: 'Hand-painted highlights' },
  { id: '3', name: 'Blowout', duration: '45 min', price: 'R45', emoji: '💨', description: 'Wash, blow-dry & finish' },
  { id: '4', name: 'Deep Conditioning', duration: '30 min', price: 'R35', emoji: '🌿', description: 'Repair & strengthen' },
  { id: '5', name: 'Keratin Treatment', duration: '3h', price: 'R250', emoji: '✨', description: 'Smooth & frizz-free' },
  { id: '6', name: 'Root Touch-Up', duration: '1h 30m', price: 'R90', emoji: '🖌️', description: 'Single process color' },
];

const STYLISTS: Stylist[] = [
  { id: '1', name: 'Ava Chen', initials: 'AC', specialty: 'Color Specialist', rating: '4.9', color: '#1952A6' },
  { id: '2', name: 'Mia Torres', initials: 'MT', specialty: 'Balayage Expert', rating: '4.8', color: '#22274C' },
  { id: '3', name: 'James Liu', initials: 'JL', specialty: 'Cut & Style', rating: '4.9', color: '#2E3F74' },
  { id: '4', name: 'Priya Shah', initials: 'PS', specialty: 'Keratin Pro', rating: '4.7', color: '#3A5199' },
  { id: '5', name: 'Leo Park', initials: 'LP', specialty: 'Men\'s Cuts', rating: '4.8', color: '#1A2F6E' },
];

const TIME_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'];

const UNAVAILABLE_SLOTS = ['9:30 AM', '11:00 AM', '1:00 PM', '3:00 PM'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getWeekDays() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      key: d.toISOString().split('T')[0],
      day: days[d.getDay()],
      date: d.getDate(),
      month: months[d.getMonth()],
      isToday: i === 0,
    };
  });
}

// ─── Fade-in Wrapper ──────────────────────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 420, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator: React.FC<{ current: number }> = ({ current }) => {
  const steps = ['Service', 'Date & Time', 'Confirm'];
  return (
    <View style={stepStyles.wrapper}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <View style={stepStyles.stepGroup}>
              <View style={[
                stepStyles.circle,
                active && stepStyles.circleActive,
                done && stepStyles.circleDone,
              ]}>
                {done
                  ? <Text style={stepStyles.checkmark}>✓</Text>
                  : <Text style={[stepStyles.circleNum, active && { color: '#fff' }]}>{i + 1}</Text>
                }
              </View>
              <Text style={[stepStyles.label, active && stepStyles.labelActive]}>{label}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[stepStyles.line, done && stepStyles.lineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const stepStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  stepGroup: { alignItems: 'center', gap: 6 },
  circle: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: theme.lavenderLight,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  circleActive: { borderColor: theme.primary, backgroundColor: theme.primary },
  circleDone: { borderColor: theme.primary, backgroundColor: '#fff' },
  circleNum: { fontSize: 13, fontWeight: '700', color: theme.mutedText },
  checkmark: { fontSize: 13, fontWeight: '800', color: theme.primary },
  label: { fontSize: 11, fontWeight: '600', color: theme.mutedText, letterSpacing: 0.3 },
  labelActive: { color: theme.primary },
  line: { flex: 1, height: 2, backgroundColor: theme.lavenderLight, marginHorizontal: 6, marginBottom: 18 },
  lineDone: { backgroundColor: theme.primary },
});

// ─── Step 1: Service Selection ────────────────────────────────────────────────
const StepService: React.FC<{
  booking: BookingState;
  onSelect: (s: Service) => void;
}> = ({ booking, onSelect }) => (
  <FadeIn>
    <Text style={s1.heading}>What service{'\n'}are you booking?</Text>
    <View style={s1.grid}>
      {SERVICES.map((svc, i) => {
        const selected = booking.service?.id === svc.id;
        return (
          <FadeIn key={svc.id} delay={i * 60}>
            <TouchableOpacity
              style={[s1.card, selected && s1.cardSelected]}
              onPress={() => onSelect(svc)}
              activeOpacity={0.8}
            >
              <View style={[s1.emojiWrap, selected && s1.emojiWrapSelected]}>
                <Text style={s1.emoji}>{svc.emoji}</Text>
              </View>
              <Text style={[s1.name, selected && s1.nameSelected]}>{svc.name}</Text>
              <Text style={[s1.meta, selected && { color: 'rgba(255,255,255,0.75)' }]}>
                {svc.duration}
              </Text>
              <Text style={[s1.price, selected && { color: '#fff' }]}>{svc.price}</Text>
              {selected && (
                <View style={s1.checkBadge}>
                  <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '800' }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </FadeIn>
        );
      })}
    </View>
  </FadeIn>
);

const s1 = StyleSheet.create({
  heading: {
    fontSize: 28, fontWeight: '800', color: theme.textPrimary,
    letterSpacing: -0.5, lineHeight: 34, marginBottom: 24, paddingHorizontal: 24,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12,
  },
  card: {
    width: (width - 56) / 2,
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: theme.lavenderLight,
    position: 'relative',
  },
  cardSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  emojiWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: theme.background,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  emojiWrapSelected: { backgroundColor: 'rgba(255,255,255,0.2)' },
  emoji: { fontSize: 22 },
  name: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  nameSelected: { color: '#fff' },
  meta: { fontSize: 12, color: theme.textSecondary, marginBottom: 4 },
  price: { fontSize: 16, fontWeight: '800', color: theme.primary },
  checkBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
});

// ─── Step 2: Date / Time ──────────────────────────────────────────────────────
const StepDateTime: React.FC<{
  booking: BookingState;
  onSelectStylist: (s: Stylist) => void;
  onSelectDate: (d: string) => void;
  onSelectTime: (t: string) => void;
}> = ({ booking, onSelectStylist, onSelectDate, onSelectTime }) => {
  const weekDays = getWeekDays();
  const dateScrollRef = useRef<ScrollView>(null);

  return (
    <FadeIn>
      {/* Stylist */}
      <Text style={s2.sectionTitle}>Choose Your Stylist</Text>
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={s2.stylistRow}
      >
        {STYLISTS.map((stylist, i) => {
          const selected = booking.stylist?.id === stylist.id;
          return (
            <FadeIn key={stylist.id} delay={i * 50}>
              <TouchableOpacity
                style={s2.stylistItem}
                onPress={() => onSelectStylist(stylist)}
                activeOpacity={0.8}
              >
                <View style={[
                  s2.avatar,
                  { backgroundColor: stylist.color },
                  selected && s2.avatarSelected,
                ]}>
                  <Text style={s2.avatarInitials}>{stylist.initials}</Text>
                  {selected && <View style={s2.avatarRing} />}
                </View>
                <Text style={[s2.stylistName, selected && { color: theme.primary }]}>
                  {stylist.name.split(' ')[0]}
                </Text>
                <Text style={s2.stylistSpec}>{stylist.specialty.split(' ')[0]}</Text>
              </TouchableOpacity>
            </FadeIn>
          );
        })}
      </ScrollView>

      {/* Date strip */}
      <Text style={[s2.sectionTitle, { marginTop: 24 }]}>Pick a Date</Text>
      <ScrollView
        ref={dateScrollRef}
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={s2.dateRow}
      >
        {weekDays.map((d) => {
          const selected = booking.date === d.key;
          return (
            <TouchableOpacity
              key={d.key}
              style={[s2.dateCell, selected && s2.dateCellSelected]}
              onPress={() => onSelectDate(d.key)}
              activeOpacity={0.8}
            >
              <Text style={[s2.dateDayLabel, selected && { color: 'rgba(255,255,255,0.8)' }]}>
                {d.isToday ? 'Today' : d.day}
              </Text>
              <Text style={[s2.dateDateNum, selected && { color: '#fff' }]}>{d.date}</Text>
              {d.isToday && !selected && <View style={s2.todayDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Time slots */}
      {booking.date && (
        <FadeIn>
          <Text style={[s2.sectionTitle, { marginTop: 24 }]}>Available Times</Text>
          <View style={s2.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const unavailable = UNAVAILABLE_SLOTS.includes(slot);
              const selected = booking.time === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[
                    s2.timeSlot,
                    selected && s2.timeSlotSelected,
                    unavailable && s2.timeSlotUnavailable,
                  ]}
                  onPress={() => !unavailable && onSelectTime(slot)}
                  activeOpacity={unavailable ? 1 : 0.8}
                  disabled={unavailable}
                >
                  <Text style={[
                    s2.timeSlotText,
                    selected && { color: '#fff', fontWeight: '700' },
                    unavailable && { color: theme.lavenderLight },
                  ]}>
                    {slot}
                  </Text>
                  {unavailable && <Text style={s2.bookedLabel}>Booked</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </FadeIn>
      )}
    </FadeIn>
  );
};

const s2 = StyleSheet.create({
  sectionTitle: {
    fontSize: 17, fontWeight: '700', color: theme.textPrimary,
    letterSpacing: -0.2, marginBottom: 14, paddingHorizontal: 24,
  },
  stylistRow: { paddingHorizontal: 24, gap: 20 },
  stylistItem: { alignItems: 'center', gap: 6 },
  avatar: {
    width: 62, height: 62, borderRadius: 31,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarSelected: { transform: [{ scale: 1.08 }] },
  avatarRing: {
    position: 'absolute', inset: -3,
    width: 68, height: 68, borderRadius: 34,
    borderWidth: 2.5, borderColor: theme.primary,
  },
  avatarInitials: { fontSize: 18, fontWeight: '800', color: '#fff' },
  stylistName: { fontSize: 13, fontWeight: '600', color: theme.textPrimary },
  stylistSpec: { fontSize: 11, color: theme.textSecondary },

  dateRow: { paddingHorizontal: 24, gap: 8 },
  dateCell: {
    width: 58, paddingVertical: 12,
    borderRadius: 14, alignItems: 'center',
    backgroundColor: theme.card,
    borderWidth: 1.5, borderColor: theme.lavenderLight,
    gap: 4,
  },
  dateCellSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  dateDayLabel: { fontSize: 11, fontWeight: '600', color: theme.textSecondary, letterSpacing: 0.3 },
  dateDateNum: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
  todayDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: theme.primary,
  },

  timeGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 24, gap: 10,
    paddingBottom: 8,
  },
  timeSlot: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.card,
    borderWidth: 1.5, borderColor: theme.lavenderLight,
    alignItems: 'center',
    minWidth: 90,
  },
  timeSlotSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  timeSlotUnavailable: { backgroundColor: theme.background, borderColor: theme.border },
  timeSlotText: { fontSize: 13, fontWeight: '600', color: theme.textPrimary },
  bookedLabel: { fontSize: 9, color: theme.lavenderLight, fontWeight: '600', letterSpacing: 0.5, marginTop: 1 },
});

// ─── Step 3: Confirm ──────────────────────────────────────────────────────────
const StepConfirm: React.FC<{
  booking: BookingState;
  onConfirm: () => void;
}> = ({ booking, onConfirm }) => {
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
  }, []);

  const formattedDate = booking.date
    ? new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <FadeIn>
      <Text style={s3.heading}>Review &{'\n'}Confirm</Text>

      <Animated.View style={[s3.summaryCard, { transform: [{ scale: scaleAnim }] }]}>
        {/* Service */}
        <View style={s3.row}>
          <View style={s3.rowIcon}>
            <Text style={{ fontSize: 18 }}>{booking.service?.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s3.rowLabel}>Service</Text>
            <Text style={s3.rowValue}>{booking.service?.name}</Text>
            <Text style={s3.rowMeta}>{booking.service?.duration} · {booking.service?.price}</Text>
          </View>
        </View>

        <View style={s3.divider} />

        {/* Stylist */}
        <View style={s3.row}>
          <View style={[s3.rowIcon, { backgroundColor: booking.stylist?.color }]}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>
              {booking.stylist?.initials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s3.rowLabel}>Stylist</Text>
            <Text style={s3.rowValue}>{booking.stylist?.name}</Text>
            <Text style={s3.rowMeta}>{booking.stylist?.specialty}</Text>
          </View>
        </View>

        <View style={s3.divider} />

        {/* Date & Time */}
        <View style={s3.row}>
          <View style={[s3.rowIcon, { backgroundColor: '#EEF2FF' }]}>
            <Text style={{ fontSize: 18 }}>📅</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s3.rowLabel}>Date & Time</Text>
            <Text style={s3.rowValue}>{formattedDate}</Text>
            <Text style={s3.rowMeta}>{booking.time}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Price breakdown */}
      <View style={s3.priceCard}>
        <View style={s3.priceRow}>
          <Text style={s3.priceLabel}>Service</Text>
          <Text style={s3.priceValue}>{booking.service?.price}</Text>
        </View>
        <View style={s3.priceRow}>
          <Text style={s3.priceLabel}>Booking fee</Text>
          <Text style={s3.priceValue}>R0.00</Text>
        </View>
        <View style={[s3.priceRow, s3.priceTotal]}>
          <Text style={s3.priceTotalLabel}>Total</Text>
          <Text style={s3.priceTotalValue}>{booking.service?.price}</Text>
        </View>
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <TouchableOpacity style={s3.confirmBtn} onPress={onConfirm} activeOpacity={0.85}>
          <Text style={s3.confirmBtnText}>Confirm Booking</Text>
        </TouchableOpacity>
        <Text style={s3.disclaimer}>
          Free cancellation up to 24 hours before your appointment
        </Text>
      </View>
    </FadeIn>
  );
};

const s3 = StyleSheet.create({
  heading: {
    fontSize: 28, fontWeight: '800', color: theme.textPrimary,
    letterSpacing: -0.5, lineHeight: 34, marginBottom: 24, paddingHorizontal: 24,
  },
  summaryCard: {
    marginHorizontal: 24,
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.lavenderLight,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  rowIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontSize: 11, fontWeight: '600', color: theme.textSecondary, letterSpacing: 0.8, marginBottom: 2 },
  rowValue: { fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
  rowMeta: { fontSize: 13, color: theme.textSecondary },
  divider: { height: 1, backgroundColor: theme.lavenderLight, marginVertical: 16 },

  priceCard: {
    marginHorizontal: 24,
    backgroundColor: theme.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.lavenderLight,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 14, color: theme.textSecondary, fontWeight: '500' },
  priceValue: { fontSize: 14, color: theme.textPrimary, fontWeight: '600' },
  priceTotal: { borderTopWidth: 1, borderTopColor: theme.lavenderLight, marginTop: 6, paddingTop: 12 },
  priceTotalLabel: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  priceTotalValue: { fontSize: 18, fontWeight: '800', color: theme.primary },

  confirmBtn: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  confirmBtnText: { color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: 0.2 },
  disclaimer: {
    textAlign: 'center', fontSize: 12,
    color: theme.textSecondary, marginTop: 12,
  },
});

// ─── Main Booking Screen ──────────────────────────────────────────────────────
const BookingScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState<BookingState>({
    service: null, stylist: null, date: null, time: null,
  });

  // Animated progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / 3,
      duration: 380,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const canProceed = () => {
    if (step === 0) return !!booking.service;
    if (step === 1) return !!(booking.stylist && booking.date && booking.time);
    return true;
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleConfirm = () => {
    // Navigate to success screen
    navigation?.navigate('BookingSuccess', { booking });
  };

  return (
    <View style={ms.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={ms.header}>
        <TouchableOpacity
          style={ms.backBtn}
          onPress={step === 0 ? () => navigation?.goBack() : handleBack}
          activeOpacity={0.7}
        >
          <Text style={ms.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={ms.headerTitle}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={ms.progressTrack}>
        <Animated.View
          style={[
            ms.progressFill,
            { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={ms.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && (
          <StepService
            booking={booking}
            onSelect={(s) => setBooking({ ...booking, service: s })}
          />
        )}
        {step === 1 && (
          <StepDateTime
            booking={booking}
            onSelectStylist={(s) => setBooking({ ...booking, stylist: s })}
            onSelectDate={(d) => setBooking({ ...booking, date: d, time: null })}
            onSelectTime={(t) => setBooking({ ...booking, time: t })}
          />
        )}
        {step === 2 && (
          <StepConfirm booking={booking} onConfirm={handleConfirm} />
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA (steps 0 & 1 only) */}
      {step < 2 && (
        <View style={ms.footer}>
          <TouchableOpacity
            style={[ms.nextBtn, !canProceed() && ms.nextBtnDisabled]}
            onPress={handleNext}
            activeOpacity={canProceed() ? 0.85 : 1}
            disabled={!canProceed()}
          >
            <Text style={ms.nextBtnText}>
              {step === 0 ? 'Choose Date & Time' : 'Review Booking'}
            </Text>
            <Text style={ms.nextBtnArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 8,
    backgroundColor: theme.background,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: theme.card,
    borderWidth: 1, borderColor: theme.lavenderLight,
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: theme.textPrimary, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.textPrimary, letterSpacing: -0.2 },

  progressTrack: {
    height: 3,
    backgroundColor: theme.lavenderLight,
    marginHorizontal: 24,
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    backgroundColor: theme.primary,
    borderRadius: 2,
  },

  scrollContent: { paddingTop: 8 },

  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.lavenderLight,
  },
  nextBtn: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  nextBtnDisabled: {
    backgroundColor: theme.lavenderLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },
  nextBtnArrow: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default BookingScreen;