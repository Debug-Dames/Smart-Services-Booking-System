import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../contants/colors';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Dames Salon</Text>
      <Text style={styles.tagline}>Luxury Beauty Experience</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navyDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.white,
  },
  tagline: {
    marginTop: 10,
    color: Colors.lavenderLight,
  },
});