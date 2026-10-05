import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, Linking, View } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import { store, RootState, AppDispatch } from './src/app/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';
import { restoreSession, setUnauthorized, setPendingDeepLink } from './src/presentation/session/sessionSlice';
import { setAuthToken, setUnauthorizedHandler } from './src/data/api/client';
import { notificationService } from './src/services/notifications/NotificationService';
import { navigationRef } from './src/navigation/navigationRef';

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

  // Deep link por Linking (cold start)
  useEffect(() => {
    Linking.getInitialURL().then(url => {
      if (url) dispatch(setPendingDeepLink(url));
    });
  }, [dispatch]);

  // Notificaciones — permiso + listeners
  useEffect(() => {
    notificationService.requestPermission().catch(() => {});

    // Foreground: usuario toca la notificación con la app abierta
    const unsub = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const link = detail.notification?.data?.deepLink as string | undefined;
        if (link && navigationRef.isReady()) {
          const path = link.replace('signal://', '');
          navigationRef.navigate(path as never);
        }
      }
    });

    // Cold start: app cerrada, usuario toca la notificación
    notifee.getInitialNotification().then(initial => {
      const link = initial?.notification?.data?.deepLink as string | undefined;
      if (link) {
        // esperar a que el nav esté listo
        setTimeout(() => {
          if (navigationRef.isReady()) {
            navigationRef.navigate(link.replace('signal://', '') as never);
          }
        }, 500);
      }
    });

    return unsub;
  }, []);

  if (hydrating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      key={user ? 'app' : 'auth'}
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