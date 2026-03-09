// src/screens/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import Colors from '../contants/colors';

const { width, height } = Dimensions.get('window');
const theme = Colors.dark;

const SplashScreen = ({ navigation }: any) => {
  // Animation values
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const logoScale      = useRef(new Animated.Value(0.85)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY       = useRef(new Animated.Value(12)).current;
  const lineWidth      = useRef(new Animated.Value(0)).current;
  const dotScale1      = useRef(new Animated.Value(0)).current;
  const dotScale2      = useRef(new Animated.Value(0)).current;
  const dotScale3      = useRef(new Animated.Value(0)).current;
  const screenOpacity  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Logo fades + scales in
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      // 2. Divider line draws
      Animated.timing(lineWidth, { toValue: 1, duration: 500, useNativeDriver: true }),
      // 3. Tagline slides up
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      // 4. Loading dots appear
      Animated.stagger(150, [
        Animated.spring(dotScale1, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
        Animated.spring(dotScale2, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
        Animated.spring(dotScale3, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
      ]),
      Animated.delay(600),
      // 5. Fade out before navigate
      Animated.timing(screenOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      navigation.replace('Login');
    });
  }, []);

  const lineScaleX = lineWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <Animated.View style={[ss.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />

      {/* Background decorative circles */}
      <View style={ss.circle1} />
      <View style={ss.circle2} />
      <View style={ss.circle3} />

      {/* Center content */}
      <View style={ss.center}>
        {/* Monogram badge */}
        <Animated.View style={[ss.monogramWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={ss.monogramInner}>
            <Text style={ss.monogram}>D</Text>
          </View>
        </Animated.View>

        {/* Logo text */}
        <Animated.Text style={[ss.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          Dames Salon
        </Animated.Text>

        {/* Animated divider */}
        <View style={ss.lineTrack}>
          <Animated.View style={[ss.lineFill, { transform: [{ scaleX: lineScaleX }] }]} />
        </View>

        {/* Tagline */}
        <Animated.Text style={[
          ss.tagline,
          { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
        ]}>
          Luxury Beauty Experience
        </Animated.Text>
      </View>

      {/* Loading dots */}
      <View style={ss.dotsRow}>
        {[dotScale1, dotScale2, dotScale3].map((dot, i) => (
          <Animated.View key={i} style={[ss.dot, { transform: [{ scale: dot }] }]} />
        ))}
      </View>
    </Animated.View>
  );
};

const ss = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Decorative background circles
  circle1: {
    position: 'absolute',
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(25,82,166,0.18)',
    top: -80, right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(189,194,219,0.07)',
    bottom: 60, left: -60,
  },
  circle3: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(25,82,166,0.10)',
    bottom: height * 0.25, right: 30,
  },

  // Center block
  center: { alignItems: 'center' },

  monogramWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(25,82,166,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(25,82,166,0.5)',
  },
  monogramInner: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: Colors.light.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  monogram: {
    fontSize: 26, fontWeight: '900',
    color: '#fff', letterSpacing: -0.5,
  },

  logo: {
    fontSize: 34, fontWeight: '800',
    color: theme.textPrimary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  lineTrack: {
    width: 120, height: 1.5,
    backgroundColor: 'rgba(189,194,219,0.2)',
    marginTop: 16, marginBottom: 14,
    overflow: 'hidden',
  },
  lineFill: {
    flex: 1, backgroundColor: Colors.light.primary,
    transformOrigin: 'left',
  },

  tagline: {
    fontSize: 13,
    color: theme.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '500',
  },

  // Loading dots
  dotsRow: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 60 : 48,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: Colors.light.primary,
    opacity: 0.7,
  },
});

export default SplashScreen;