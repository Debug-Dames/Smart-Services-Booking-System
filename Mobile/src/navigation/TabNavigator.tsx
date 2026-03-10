import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import MyBookingsScreen from '../screens/booking/BookingSummaryScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../contants/theme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const theme = Colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.background }, // header background
        headerTintColor: theme.textPrimary, // header text color
        headerTitleStyle: { fontWeight: 'bold' }, // header title style
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedText,
        tabBarStyle: { backgroundColor: '#FFFFFF', height: 70, paddingBottom: 8, paddingTop: 8 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          if (route.name === 'Chat') iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Bookings" component={BookingScreen} options={{ headerShown: false }} />
      <Tab.Screen name="My Bookings" component={MyBookingsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />  
    </Tab.Navigator>
  );
}