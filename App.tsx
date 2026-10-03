import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { store, RootState, AppDispatch } from './src/app/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';
import { restoreSession, setUnauthorized } from './src/presentation/session/sessionSlice';
import { setAuthToken, setUnauthorizedHandler } from './src/data/api/client';

const Boot = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hydrating = useSelector((s: RootState) => s.session.hydrating);
  const token = useSelector((s: RootState) => s.session.token);
  const user = useSelector((s: RootState) => s.session.user);

  useEffect(() => { dispatch(restoreSession()); }, [dispatch]);
  useEffect(() => { setAuthToken(token); }, [token]);
  useEffect(() => {
    setUnauthorizedHandler(() => dispatch(setUnauthorized()));
  }, [dispatch]);

  if (hydrating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer
      key={user ? 'app' : 'auth'}   // 👈 remount al cambiar sesión
      linking={linking}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Boot />
      </SafeAreaProvider>
    </Provider>
  );
}