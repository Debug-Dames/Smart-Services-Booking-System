import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store, { useAppDispatch } from './src/app/store';
import { restoreSession } from './src/features/auth/authThunks';
import RootNavigator from './src/navigation/AppNavigator';
// Inner component so it can use dispatch inside the Provider
function AppBoot() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restore auth session from SecureStore on every app launch
    dispatch(restoreSession());
  }, [dispatch]);

  return <RootNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <AppBoot />
    </Provider>
  );
}