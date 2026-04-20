import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../app/store';
import { logoutUser } from '../../features/auth/authThunks';
import Colors from '../../contants/theme';
import api from '../../api/axiosInstance'; // adjust to your axios instance path

const theme = Colors.light;

// ─── Avatar initials ───────────────────────────────────────────
function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

// ─── Info row ──────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={theme.primary} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

// ─── Stat card ─────────────────────────────────────────────────
function StatCard({
  icon,
  count,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

type BookingStats = {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
};

// ─── Main screen ───────────────────────────────────────────────
export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/bookings/my');
        const bookings: { status: string }[] = data;
        setStats({
          total: bookings.length,
          confirmed: bookings.filter((b) => b.status === 'confirmed').length,
          pending: bookings.filter((b) => b.status === 'pending').length,
          cancelled: bookings.filter((b) => b.status === 'cancelled').length,
        });
      } catch {
        // silently fail — stats show 0
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logoutUser());
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  if (loading || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Header ── */}
      <View style={styles.headerCard}>
        <AvatarInitials name={user.name} />
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </View>

      {/* ── Booking stats ── */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Booking Stats</Text>
        {statsLoading ? (
          <ActivityIndicator color={theme.primary} style={{ marginVertical: 12 }} />
        ) : (
          <View style={styles.statsRow}>
            <StatCard icon="calendar"              count={stats.total}     label="Total"     color={theme.primary} />
            <StatCard icon="checkmark-circle"      count={stats.confirmed} label="Confirmed" color="#10B981"       />
            <StatCard icon="time-outline"          count={stats.pending}   label="Pending"   color="#F59E0B"       />
            <StatCard icon="close-circle-outline"  count={stats.cancelled} label="Cancelled" color="#EF4444"       />
          </View>
        )}
      </View>

      {/* ── Account info ── */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <InfoRow icon="mail-outline"   label="Email"  value={user.email ?? 'Not specified'}            />
        <InfoRow icon="call-outline"   label="Phone"  value={user.phone ?? 'Not specified'}            />
        <InfoRow icon="person-outline" label="Gender" value={user.gender ?? 'Not specified'} />
      </View>

      {/* ── Actions ── */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={20} color={theme.textPrimary} />
          <Text style={styles.menuLabel}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.mutedText} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('My Bookings')}
        >
          <Ionicons name="calendar-outline" size={20} color={theme.textPrimary} />
          <Text style={styles.menuLabel}>My Bookings</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.mutedText} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutLabel}>Log Out</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    padding: 28,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: theme.primary + '18',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Generic card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 14,
    borderTopWidth: 3,
    gap: 4,
  },
  statCount: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.mutedText,
    fontWeight: '500',
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: theme.mutedText,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
  },

  // Menu items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuLabel: {
    fontSize: 15,
    color: theme.textPrimary,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },

  // Logout
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  logoutLabel: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
  },
});