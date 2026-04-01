// src/screens/bookings/MyBookingsScreen.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../../contants/colors';
import { AppDispatch } from '../../app/store';
import { fetchMyBookings, cancelBooking } from '../../features/booking/BookingThunks';
import {
  selectBookings,
  selectBookingLoading,
  selectBookingError,
  clearBookingError,
} from '../../features/booking/bookingSlice';
import { Booking, BookingStatus } from '../../features/booking/bookingTypes';

const { width } = Dimensions.get('window');
const theme = Colors.light;

// ─── Status mapping ───────────────────────────────────────────
// Backend statuses: "pending" | "confirmed" | "cancelled" | "completed"
// Display statuses: "Upcoming" | "Completed" | "Cancelled"
type DisplayStatus = 'Upcoming' | 'Completed' | 'Cancelled';

function toDisplayStatus(status: BookingStatus): DisplayStatus {
  if (status === 'confirmed' || status === 'pending') return 'Upcoming';
  if (status === 'completed') return 'Completed';
  return 'Cancelled';
}

const STATUS_CONFIG: Record<DisplayStatus, { bg: string; text: string; dot: string }> = {
  Upcoming:  { bg: 'rgba(25,82,166,0.10)',  text: theme.primary, dot: theme.primary },
  Completed: { bg: 'rgba(34,180,100,0.10)', text: '#1A8A50',     dot: '#1A8A50' },
  Cancelled: { bg: 'rgba(220,60,60,0.10)',  text: '#C03030',     dot: '#C03030' },
};

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDuration(startIso: string, endIso: string): string {
  const diff = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000;
  if (diff < 60) return `${diff} min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatPrice(price: number): string {
  return `R${price.toFixed(0)}`;
}

function getEmoji(serviceName: string): string {
  const name = serviceName?.toLowerCase() ?? '';
  if (name.includes('nail') || name.includes('manicure')) return '💅';
  if (name.includes('hair') || name.includes('cut'))       return '✂️';
  if (name.includes('balayage') || name.includes('color')) return '🎨';
  if (name.includes('blowout') || name.includes('blow'))   return '💨';
  if (name.includes('condition'))                          return '🌿';
  if (name.includes('keratin'))                            return '✨';
  if (name.includes('root'))                               return '🖌️';
  return '💇';
}

// ─── Fade-in wrapper ──────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};

// ─── Filter Tab ───────────────────────────────────────────────
const FilterTab: React.FC<{
  label: string;
  active: boolean;
  count: number;
  onPress: () => void;
}> = ({ label, active, count, onPress }) => (
  <TouchableOpacity
    style={[ft.tab, active && ft.tabActive]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Text style={[ft.label, active && ft.labelActive]}>{label}</Text>
    {count > 0 && (
      <View style={[ft.badge, active && ft.badgeActive]}>
        <Text style={[ft.badgeText, active && ft.badgeTextActive]}>{count}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const ft = StyleSheet.create({
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 50, backgroundColor: theme.card,
    borderWidth: 1.5, borderColor: theme.lavenderLight,
  },
  tabActive:       { backgroundColor: theme.primary, borderColor: theme.primary },
  label:           { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
  labelActive:     { color: '#fff' },
  badge:           { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: theme.lavenderLight, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeActive:     { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeText:       { fontSize: 10, fontWeight: '800', color: theme.textSecondary },
  badgeTextActive: { color: '#fff' },
});

// ─── Booking Card ─────────────────────────────────────────────
const BookingCard: React.FC<{
  item: Booking;
  index: number;
  onCancel: (id: string) => void;
  onRebook: () => void;
}> = ({ item, index, onCancel, onRebook }) => {
  const displayStatus = toDisplayStatus(item.status);
  const cfg           = STATUS_CONFIG[displayStatus];
  const emoji         = getEmoji(item.serviceName ?? item.service?.name ?? '');
  const dateLabel     = formatDate(item.date);
  const timeLabel     = formatTime(item.startTime);
  const duration      = formatDuration(item.startTime, item.endTime);
  const price         = formatPrice(item.price ?? item.service?.price ?? 0);

  return (
    <FadeIn delay={index * 80}>
      <View style={bc.card}>
        <View style={[bc.accentBar, { backgroundColor: cfg.dot }]} />
        <View style={bc.inner}>

          {/* Top row */}
          <View style={bc.topRow}>
            <View style={bc.emojiWrap}>
              <Text style={{ fontSize: 20 }}>{emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={bc.serviceName}>{item.serviceName ?? item.service?.name ?? 'Service'}</Text>
              {/* Show pending payment notice */}
              {item.status === 'pending' && (
                <Text style={bc.pendingNote}>⏳ Awaiting payment</Text>
              )}
            </View>
            <View style={[bc.statusBadge, { backgroundColor: cfg.bg }]}>
              <View style={[bc.statusDot, { backgroundColor: cfg.dot }]} />
              <Text style={[bc.statusText, { color: cfg.text }]}>
                {item.status === 'pending' ? 'Pending' : displayStatus}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={bc.divider} />

          {/* Meta row */}
          <View style={bc.metaRow}>
            <View style={bc.metaItem}>
              <Text style={bc.metaLabel}>DATE</Text>
              <Text style={bc.metaValue}>{dateLabel}</Text>
            </View>
            <View style={bc.metaSep} />
            <View style={bc.metaItem}>
              <Text style={bc.metaLabel}>TIME</Text>
              <Text style={bc.metaValue}>{timeLabel}</Text>
            </View>
            <View style={bc.metaSep} />
            <View style={bc.metaItem}>
              <Text style={bc.metaLabel}>DURATION</Text>
              <Text style={bc.metaValue}>{duration}</Text>
            </View>
            <View style={bc.metaSep} />
            <View style={bc.metaItem}>
              <Text style={bc.metaLabel}>PRICE</Text>
              <Text style={[bc.metaValue, { color: theme.primary }]}>{price}</Text>
            </View>
          </View>

          {/* Actions */}
          {(item.status === 'confirmed' || item.status === 'pending') && (
            <View style={bc.actions}>
              <TouchableOpacity
                style={bc.cancelBtn}
                onPress={() => onCancel(String(item.id))}
                activeOpacity={0.8}
              >
                <Text style={bc.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={bc.rescheduleBtn} activeOpacity={0.8}>
                <Text style={bc.rescheduleText}>Reschedule</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'completed' && (
            <View style={bc.actions}>
              <TouchableOpacity style={bc.rebookBtn} onPress={onRebook} activeOpacity={0.8}>
                <Text style={bc.rebookText}>Book Again →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </FadeIn>
  );
};

const bc = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: theme.card,
    borderRadius: 18, marginBottom: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: theme.lavenderLight,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  accentBar:   { width: 4 },
  inner:       { flex: 1, padding: 16 },
  topRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  emojiWrap:   { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' },
  serviceName: { fontSize: 15, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
  pendingNote: { fontSize: 11, color: '#F59E0B', fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 50 },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  divider:     { height: 1, backgroundColor: theme.border, marginBottom: 14 },
  metaRow:     { flexDirection: 'row', alignItems: 'center' },
  metaItem:    { flex: 1, alignItems: 'center' },
  metaLabel:   { fontSize: 9, fontWeight: '700', color: theme.mutedText, letterSpacing: 0.8, marginBottom: 3 },
  metaValue:   { fontSize: 12, fontWeight: '700', color: theme.textPrimary, textAlign: 'center' },
  metaSep:     { width: 1, height: 28, backgroundColor: theme.border },
  actions:     { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn:   { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E0BABA', alignItems: 'center', backgroundColor: '#FEF2F2' },
  cancelText:  { fontSize: 13, fontWeight: '700', color: '#C03030' },
  rescheduleBtn: { flex: 2, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.primary, alignItems: 'center' },
  rescheduleText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  rebookBtn:   { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(25,82,166,0.1)', alignItems: 'center' },
  rebookText:  { fontSize: 13, fontWeight: '700', color: theme.primary },
});

// ─── Empty State ──────────────────────────────────────────────
const EmptyState: React.FC<{ filter: string; onBook: () => void }> = ({ filter, onBook }) => (
  <FadeIn delay={100}>
    <View style={es.wrap}>
      <Text style={es.emoji}>🗓️</Text>
      <Text style={es.title}>No {filter.toLowerCase()} bookings</Text>
      <Text style={es.subtitle}>
        {filter === 'Upcoming'
          ? "You don't have any upcoming appointments."
          : `No ${filter.toLowerCase()} appointments to show.`}
      </Text>
      {filter === 'Upcoming' && (
        <TouchableOpacity style={es.btn} onPress={onBook} activeOpacity={0.85}>
          <Text style={es.btnText}>Book a Service</Text>
        </TouchableOpacity>
      )}
    </View>
  </FadeIn>
);

const es = StyleSheet.create({
  wrap:     { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emoji:    { fontSize: 52, marginBottom: 16 },
  title:    { fontSize: 18, fontWeight: '700', color: theme.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  btn:      { backgroundColor: theme.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  btnText:  { color: '#fff', fontWeight: '800', fontSize: 15 },
});

// ─── Main Screen ──────────────────────────────────────────────
const FILTERS: DisplayStatus[] = ['Upcoming', 'Completed', 'Cancelled'];

const MyBookingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const dispatch   = useDispatch<AppDispatch>();
  const bookings   = useSelector(selectBookings);
  const loading    = useSelector(selectBookingLoading);
  const error      = useSelector(selectBookingError);

  const [activeFilter, setActiveFilter] = React.useState<DisplayStatus>('Upcoming');

  // Fetch on screen focus (refreshes when navigating back from BookingScreen)
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyBookings());
    }, [dispatch])
  );

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearBookingError()) },
      ]);
    }
  }, [error]);

  // Filter bookings by display status
  const filtered = bookings.filter(b => toDisplayStatus(b.status) === activeFilter);

  const counts = {
    Upcoming:  bookings.filter(b => toDisplayStatus(b.status) === 'Upcoming').length,
    Completed: bookings.filter(b => toDisplayStatus(b.status) === 'Completed').length,
    Cancelled: bookings.filter(b => toDisplayStatus(b.status) === 'Cancelled').length,
  };

  const handleCancel = (id: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => dispatch(cancelBooking(id)),
        },
      ]
    );
  };

  return (
    <View style={ms.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={ms.header}>
        <TouchableOpacity
          style={ms.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Text style={ms.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={ms.headerTitle}>My Bookings</Text>
          <Text style={ms.headerSub}>{bookings.length} total appointments</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter tabs */}
      <FadeIn delay={100}>
        <View style={ms.filterRow}>
          {FILTERS.map(f => (
            <FilterTab
              key={f}
              label={f}
              active={activeFilter === f}
              count={counts[f]}
              onPress={() => setActiveFilter(f)}
            />
          ))}
        </View>
      </FadeIn>

      {/* Loading state */}
      {loading && bookings.length === 0 && (
        <View style={ms.loadingWrap}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={ms.loadingText}>Loading your bookings…</Text>
        </View>
      )}

      {/* List */}
      {!loading || bookings.length > 0 ? (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={({ item, index }) => (
            <BookingCard
              item={item}
              index={index}
              onCancel={handleCancel}
              onRebook={() => navigation?.navigate('Bookings')}
            />
          )}
          contentContainerStyle={ms.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => dispatch(fetchMyBookings())}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                filter={activeFilter}
                onBook={() => navigation?.navigate('Bookings')}
              />
            ) : null
          }
        />
      ) : null}
    </View>
  );
};

const ms = StyleSheet.create({
  container:   { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 16,
  },
  backBtn:     { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.lavenderLight, alignItems: 'center', justifyContent: 'center' },
  backArrow:   { fontSize: 18, color: theme.textPrimary, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.3, textAlign: 'center' },
  headerSub:   { fontSize: 12, color: theme.textSecondary, textAlign: 'center', fontWeight: '500', marginTop: 2 },
  filterRow:   { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: theme.textSecondary, fontWeight: '500' },
});

export default MyBookingsScreen;