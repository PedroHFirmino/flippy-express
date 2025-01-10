import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './store';
import HomeScreen from './user_screens/HomeScreen';
import MapScreen from './user_screens/MapScreen';
import HomeLogin from './home_login_screen/HomeLogin';
import SignIn from './home_login_screen/SignIn';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <Provider store={store}>
      <NavigationContainer>
      <SafeAreaProvider>
        <Stack.Navigator>
        <Stack.Screen 
            name='HomeLogin'
            component={HomeLogin}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name='SignIn'
            component={SignIn}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name='Início'
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name='Mapa'
            component={MapScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </SafeAreaProvider>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
