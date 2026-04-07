// src/screens/auth/LoginScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import Colors from '../../contants/colors';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { loginUser } from '../../features/auth/authThunks';
import { selectAuthLoading, selectAuthError, clearAuthError } from '../../features/auth/authSlice';


const { height } = Dimensions.get('window');
const theme = Colors.light;

// ─── Animated input field ─────────────────────────────────────────────────────
const FloatingInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}> = ({ label, value, onChangeText, secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'none' }) => {
  const [focused, setFocused] = useState(false);
  const [shown, setShown] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.parallel([
      Animated.timing(labelAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    if (!value) {
      Animated.timing(labelAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  };

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 6] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.mutedText, theme.primary],
  });
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.lavenderLight, theme.primary],
  });

  return (
    <Animated.View style={[fi.wrap, { borderColor }]}>
      <Animated.Text style={[fi.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}>
        {label}
      </Animated.Text>
      <TextInput
        style={fi.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry && !shown}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {secureTextEntry && (
        <TouchableOpacity style={fi.eyeBtn} onPress={() => setShown(!shown)}>
          <Text style={fi.eyeIcon}>{shown ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const fi = StyleSheet.create({
  wrap: {
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
    height: 60,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 10,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  input: {
    fontSize: 15,
    color: theme.textPrimary,
    fontWeight: '500',
    paddingRight: 40,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0, bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: { fontSize: 16 },
});

// ─── FadeIn wrapper ───────────────────────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const LoginScreen = ({ navigation }: any) => {
  const dispatch  = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loading   = useAppSelector(selectAuthLoading);
  const apiError  = useAppSelector(selectAuthError);

  // Clear any previous auth errors when screen mounts
    useEffect(() => {
      dispatch(clearAuthError());
    }, [dispatch]);
  
    // Inline validation
    const emailValid   = email.length === 0            ? null : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid= password.length === 0         ? null : password.length >= 8;  
    const canSubmit = emailValid && passwordValid && !loading;
  

  const handleLogin = async () => {
      if (!canSubmit) return;
      dispatch(loginUser({
        email:    email.trim(),
        password,
      }));
      // No navigation.navigate() needed — AppNavigator watches isLoggedIn from Redux.
      // When registerUser succeeds, isLoggedIn becomes true and the navigator
      // automatically switches to MainNavigator (which shows the Tabs).
    };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      {/* Top decorative panel */}
      <View style={ls.topPanel}>
        <View style={ls.panelCircle1} />
        <View style={ls.panelCircle2} />
        <FadeIn delay={0}>
          <View style={ls.monogramWrap}>
            <Text style={ls.monogram}>D</Text>
          </View>
          <Text style={ls.brandName}>Dames Salon</Text>
        </FadeIn>
      </View>

      <ScrollView
        contentContainerStyle={ls.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FadeIn delay={150}>
          <Text style={ls.title}>Welcome back</Text>
          <Text style={ls.subtitle}>Sign in to your account</Text>
        </FadeIn>

        <FadeIn delay={250}>
          <FloatingInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <FloatingInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </FadeIn>

        <FadeIn delay={300}>
          <TouchableOpacity style={ls.forgotBtn} activeOpacity={0.7}>
            <Text style={ls.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </FadeIn>


        {/* API error from Redux */}
          {apiError ? (
            <FadeIn delay={0}>
              <Text style={ls.apiError}>{apiError}</Text>
            </FadeIn>
          ) : null}



        <FadeIn delay={380}>
          <TouchableOpacity
            style={ls.loginBtn}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={ls.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </FadeIn>

        {/* Divider */}
        <FadeIn delay={450}>
          <View style={ls.dividerRow}>
            <View style={ls.dividerLine} />
            <Text style={ls.dividerText}>or continue with</Text>
            <View style={ls.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={ls.socialRow}>
            <TouchableOpacity style={ls.socialBtn} activeOpacity={0.8}>
              <Text style={ls.socialIcon}>G</Text>
              <Text style={ls.socialLabel}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ls.socialBtn} activeOpacity={0.8}>
              <Text style={ls.socialIcon}>f</Text>
              <Text style={ls.socialLabel}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

        <FadeIn delay={520}>
          <TouchableOpacity
            style={ls.signupRow}
            onPress={() => navigation.navigate('Signup')}
            activeOpacity={0.7}
          >
            <Text style={ls.signupText}>Don't have an account? </Text>
            <Text style={ls.signupLink}>Create one</Text>
          </TouchableOpacity>
        </FadeIn>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const PANEL_HEIGHT = height * 0.28;

const ls = StyleSheet.create({
  topPanel: {
    height: PANEL_HEIGHT,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 28,
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  panelCircle1: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(25,82,166,0.25)',
    top: -60, right: -40,
  },
  panelCircle2: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(189,194,219,0.08)',
    bottom: -20, left: -20,
  },
  monogramWrap: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: Colors.light.primary,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  monogram: { fontSize: 22, fontWeight: '900', color: '#fff' },
  brandName: {
    fontSize: 18, fontWeight: '800',
    color: '#fff', letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },

  title: {
    fontSize: 28, fontWeight: '800',
    color: theme.textPrimary, letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14, color: theme.textSecondary,
    marginBottom: 28, fontWeight: '500',
  },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: 4 },
  forgotText: { fontSize: 13, color: theme.primary, fontWeight: '600' },
  apiError: {
    fontSize: 13, color: '#C03030', fontWeight: '600',
    backgroundColor: '#FEF2F2', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 16, overflow: 'hidden',
  },
  loginBtn: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOpacity: 0.38,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },

  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 24, gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.lavenderLight },
  dividerText: { fontSize: 12, color: theme.mutedText, fontWeight: '600', letterSpacing: 0.3 },

  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14,
    backgroundColor: theme.card,
    borderWidth: 1.5, borderColor: theme.lavenderLight,
  },
  socialIcon: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  socialLabel: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },

  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 14, color: theme.textSecondary },
  signupLink: { fontSize: 14, color: theme.primary, fontWeight: '700' },
});

export default LoginScreen;