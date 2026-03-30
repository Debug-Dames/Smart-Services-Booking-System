// src/screens/auth/SignupScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, ScrollView, Platform,
  StatusBar, Dimensions, ActivityIndicator,
} from 'react-native';
import Colors from '../../contants/colors';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { registerUser } from '../../features/auth/authThunks';
import { selectAuthLoading, selectAuthError, clearAuthError } from '../../features/auth/authSlice';

const { height } = Dimensions.get('window');
const theme = Colors.light;

// ─── Floating Label Input ─────────────────────────────────────────────────────
const FloatingInput: React.FC<{
  label: string; value: string; onChangeText: (t: string) => void;
  secureTextEntry?: boolean; keyboardType?: any; autoCapitalize?: any;
  valid?: boolean | null; errorMsg?: string;
}> = ({ label, value, onChangeText, secureTextEntry = false, keyboardType = 'default', autoCapitalize = 'none', valid = null, errorMsg }) => {
  const [shown, setShown] = useState(false);
  const labelAnim  = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.parallel([
      Animated.timing(labelAnim,  { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };
  const handleBlur = () => {
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    if (!value) Animated.timing(labelAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const labelTop    = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 6] });
  const labelSize   = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [valid === false ? '#C03030' : theme.lavenderLight, valid === false ? '#C03030' : theme.primary] });
  const labelColor  = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [theme.mutedText, valid === false ? '#C03030' : theme.primary] });

  return (
    <View style={{ marginBottom: 14 }}>
      <Animated.View style={[fi.wrap, { borderColor }]}>
        <Animated.Text style={[fi.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}>{label}</Animated.Text>
        <TextInput style={fi.input} value={value} onChangeText={onChangeText} onFocus={handleFocus} onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !shown} keyboardType={keyboardType} autoCapitalize={autoCapitalize} autoCorrect={false} />
        {valid === true && !secureTextEntry && <View style={fi.checkWrap}><Text style={{ fontSize: 13, color: '#1A8A50' }}>✓</Text></View>}
        {secureTextEntry && <TouchableOpacity style={fi.eyeBtn} onPress={() => setShown(!shown)}><Text style={fi.eyeIcon}>{shown ? '🙈' : '👁️'}</Text></TouchableOpacity>}
      </Animated.View>
      {valid === false && errorMsg && <Text style={fi.errorMsg}>{errorMsg}</Text>}
    </View>
  );
};

const fi = StyleSheet.create({
  wrap:      { backgroundColor: theme.card, borderRadius: 14, borderWidth: 1.5, height: 60, justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 10, position: 'relative' },
  label:     { position: 'absolute', left: 16, fontWeight: '600', letterSpacing: 0.2 },
  input:     { fontSize: 15, color: theme.textPrimary, fontWeight: '500', paddingRight: 40 },
  checkWrap: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  eyeBtn:    { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  eyeIcon:   { fontSize: 16 },
  errorMsg:  { fontSize: 11, color: '#C03030', fontWeight: '600', marginTop: 4, marginLeft: 4 },
});

// ─── Gender Selector ──────────────────────────────────────────────────────────
const GENDERS = ['Male', 'Female', 'Other'];

const GenderSelector: React.FC<{ value: string; onChange: (g: string) => void; valid: boolean | null }> = ({ value, onChange, valid }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={gs.label}>Gender</Text>
    <View style={gs.row}>
      {GENDERS.map(g => (
        <TouchableOpacity key={g} style={[gs.option, value === g && gs.optionSelected, valid === false && gs.optionError]} onPress={() => onChange(g)} activeOpacity={0.8}>
          <Text style={[gs.optionText, value === g && gs.optionTextSelected]}>{g}</Text>
        </TouchableOpacity>
      ))}
    </View>
    {valid === false && <Text style={gs.errorMsg}>Please select a gender</Text>}
  </View>
);

const gs = StyleSheet.create({
  label:              { fontSize: 11, fontWeight: '600', color: theme.mutedText, marginBottom: 8, marginLeft: 4, letterSpacing: 0.2 },
  row:                { flexDirection: 'row', gap: 8 },
  option:             { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: theme.lavenderLight, backgroundColor: theme.card, alignItems: 'center' },
  optionSelected:     { backgroundColor: theme.primary, borderColor: theme.primary },
  optionError:        { borderColor: '#C03030' },
  optionText:         { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
  optionTextSelected: { color: '#fff' },
  errorMsg:           { fontSize: 11, color: '#C03030', fontWeight: '600', marginTop: 4, marginLeft: 4 },
});

// ─── Password strength bar ────────────────────────────────────────────────────
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8)           score++;
    if (/[A-Z]/.test(password))         score++;
    if (/[0-9]/.test(password))         score++;
    if (/[^A-Za-z0-9]/.test(password))  score++;
    return score;
  };
  const strength = getStrength();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#C03030', '#E57B00', '#1A7AC0', '#1A8A50'];
  if (!password) return null;
  return (
    <View style={ps.wrap}>
      <View style={ps.bars}>
        {[1, 2, 3, 4].map(i => <View key={i} style={[ps.bar, { backgroundColor: i <= strength ? colors[strength] : theme.lavenderLight }]} />)}
      </View>
      <Text style={[ps.label, { color: colors[strength] }]}>{labels[strength]}</Text>
    </View>
  );
};

const ps = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -6, marginBottom: 14 },
  bars:  { flex: 1, flexDirection: 'row', gap: 4 },
  bar:   { flex: 1, height: 3, borderRadius: 2 },
  label: { fontSize: 11, fontWeight: '700', width: 40, textAlign: 'right' },
});

// ─── FadeIn wrapper ───────────────────────────────────────────────────────────
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const SignupScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const loading  = useAppSelector(selectAuthLoading);
  const apiError = useAppSelector(selectAuthError);

  const [fullName,        setFullName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [phone,           setPhone]           = useState('');
  const [gender,          setGender]          = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed,          setAgreed]          = useState(false);

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  // Validation — null = untouched, true = valid, false = invalid
  const nameValid     = fullName.length === 0        ? null : fullName.trim().length >= 2;
  const emailValid    = email.length === 0           ? null : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneValid    = phone.length === 0           ? null : /^\+?[\d\s\-]{7,15}$/.test(phone.trim());
  const genderValid   = gender === ''                ? null : true as true;
  const passwordValid = password.length === 0        ? null : password.length >= 8;
  const confirmValid  = confirmPassword.length === 0 ? null : confirmPassword === password;

  const canSubmit =
    nameValid && emailValid && phoneValid && genderValid &&
    passwordValid && confirmValid && agreed && !loading;

  const handleRegister = async () => {
    if (!canSubmit) return;
    const result = await dispatch(registerUser({
      name:     fullName.trim(),
      email:    email.trim(),
      phone:    phone.trim(),
      gender,
      password,
    }));
    if (registerUser.fulfilled.match(result)) {
      navigation.navigate('Login');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />

      <View style={su.topPanel}>
        <View style={su.panelCircle1} />
        <View style={su.panelCircle2} />
        <FadeIn delay={0}>
          <View style={su.monogramWrap}><Text style={su.monogram}>D</Text></View>
          <Text style={su.brandName}>Dames Salon</Text>
        </FadeIn>
      </View>

      <ScrollView contentContainerStyle={su.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <FadeIn delay={150}>
          <Text style={su.title}>Create account</Text>
          <Text style={su.subtitle}>Join for a luxury beauty experience</Text>
        </FadeIn>

        <FadeIn delay={220}>
          <FloatingInput label="Full Name"     value={fullName}  onChangeText={setFullName}  autoCapitalize="words"   valid={nameValid}     errorMsg="Please enter your full name" />
          <FloatingInput label="Email address" value={email}     onChangeText={setEmail}     keyboardType="email-address" valid={emailValid} errorMsg="Please enter a valid email" />
          <FloatingInput label="Phone number"  value={phone}     onChangeText={setPhone}     keyboardType="phone-pad" valid={phoneValid}     errorMsg="Please enter a valid phone number" />
          <GenderSelector value={gender} onChange={setGender} valid={genderValid} />
          <FloatingInput label="Password"         value={password}        onChangeText={setPassword}        secureTextEntry valid={passwordValid} errorMsg="Password must be at least 8 characters" />
          <PasswordStrength password={password} />
          <FloatingInput label="Confirm Password" value={confirmPassword}  onChangeText={setConfirmPassword} secureTextEntry valid={confirmValid}  errorMsg="Passwords do not match" />
        </FadeIn>

        {apiError ? <FadeIn delay={0}><Text style={su.apiError}>{apiError}</Text></FadeIn> : null}

        <FadeIn delay={300}>
          <TouchableOpacity style={su.termsRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.8}>
            <View style={[su.checkbox, agreed && su.checkboxChecked]}>
              {agreed && <Text style={su.checkmark}>✓</Text>}
            </View>
            <Text style={su.termsText}>
              I agree to the <Text style={su.termsLink}>Terms of Service</Text> and <Text style={su.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </FadeIn>

        <FadeIn delay={380}>
          <TouchableOpacity style={[su.signupBtn, !canSubmit && su.signupBtnDisabled]} onPress={handleRegister} activeOpacity={canSubmit ? 0.85 : 1}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={su.signupBtnText}>Create Account</Text>}
          </TouchableOpacity>
        </FadeIn>

        <FadeIn delay={450}>
          <TouchableOpacity style={su.loginRow} onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={su.loginText}>Already have an account? </Text>
            <Text style={su.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </FadeIn>

        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const PANEL_HEIGHT = height * 0.22;

const su = StyleSheet.create({
  topPanel:          { height: PANEL_HEIGHT, backgroundColor: Colors.dark.background, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 22, overflow: 'hidden', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  panelCircle1:      { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(25,82,166,0.22)', top: -50, right: -30 },
  panelCircle2:      { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(189,194,219,0.07)', bottom: -10, left: -10 },
  monogramWrap:      { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.light.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 8, shadowColor: Colors.light.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  monogram:          { fontSize: 18, fontWeight: '900', color: '#fff' },
  brandName:         { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'center' },
  scroll:            { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  title:             { fontSize: 28, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.4, marginBottom: 4 },
  subtitle:          { fontSize: 14, color: theme.textSecondary, marginBottom: 24, fontWeight: '500' },
  apiError:          { fontSize: 13, color: '#C03030', fontWeight: '600', backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, overflow: 'hidden' },
  termsRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 22 },
  checkbox:          { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: theme.lavenderLight, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked:   { backgroundColor: theme.primary, borderColor: theme.primary },
  checkmark:         { fontSize: 12, color: '#fff', fontWeight: '800' },
  termsText:         { flex: 1, fontSize: 13, color: theme.textSecondary, lineHeight: 20 },
  termsLink:         { color: theme.primary, fontWeight: '700' },
  signupBtn:         { backgroundColor: theme.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: theme.primary, shadowOpacity: 0.38, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 6, marginBottom: 16 },
  signupBtnDisabled: { backgroundColor: theme.lavenderLight, shadowOpacity: 0, elevation: 0 },
  signupBtnText:     { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },
  loginRow:          { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText:         { fontSize: 14, color: theme.textSecondary },
  loginLink:         { fontSize: 14, color: theme.primary, fontWeight: '700' },
});

export default SignupScreen;