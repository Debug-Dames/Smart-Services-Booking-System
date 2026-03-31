// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import AuthNavigator from './AuthNavigator';
// import MainNavigator from './MainNavigator';

// const isLoggedIn = true; // later connect Redux

// export default function AppNavigator() {
//   return (
//     <NavigationContainer>
//       {isLoggedIn ? <MainNavigator /> : <AuthNavigator />}
//     </NavigationContainer>
//   );
// }


import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useAppDispatch, useAppSelector } from '../app/store';
import { restoreSession } from '../features/auth/authThunks';
import { selectIsLoggedIn, selectAuthLoading } from '../features/auth/authSlice';

export default function AppNavigator() {
  const dispatch   = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const loading    = useAppSelector(selectAuthLoading);

  useEffect(() => {
    // On app launch, restore token + user from SecureStore
    dispatch(restoreSession());
  }, [dispatch]);

  // Show spinner while checking stored session
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}