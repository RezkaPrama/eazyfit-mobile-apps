import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { restoreSession } from './src/store/authSlice';
import { navTheme } from './src/theme';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    store.dispatch(restoreSession());
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
