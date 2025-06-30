import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './store';
import HomeScreen from './user_screens/HomeScreen';
import MapScreen from './user_screens/MapScreen';
import HomeLogin from './home_login_screen/HomeLogin';
import HomeChoice from './home_login_screen/HomeChoice';
import SignUpUsers from './login_signup_user/SignUpUsers';
import SignInUser from './login_signup_user/SignInUser';
import SignInMotoB from './login_signup_motob/SignInMotoB';
import SuccessScreenUser from './login_signup_user/SuccessScreenUser';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpMotoB from './login_signup_motob/SignUpMotoB';
import SuccessScreenMotoB from './login_signup_motob/SuccessScreenMotoB';
import ProfileScreen from './user_screens/ProfileScreen';
import MotoboyMapScreen from './mototboy_screens/MotoboyMapScreen';
import MotoboyHomeScreen from './mototboy_screens/MotoboyHomeScreen';
import RankingScreen from './motoboy_components/RankingScreen';
import ConfigScreen from './mototboy_screens/ConfigScreen';
import PagamentoPixScreen from './user_screens/PagamentoPixScreen';




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
            name='HomeChoice'
            component={HomeChoice}
            options={{
              headerShown: false,
            }}
          />
          {/* Users */}
          <Stack.Screen 
            name='SignInUser'
            component={SignInUser}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name='SuccessScreenUser'
            component={SuccessScreenUser}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name='SignUpUsers'
            component={SignUpUsers}
            options={{
              headerShown: false,
            }}
          />

          {/* Users Menu */}

          <Stack.Screen 
            name='HomeScreen'
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name='ProfileScreen'
            component={ProfileScreen}
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
          {/* Motoboy */}
          <Stack.Screen 
            name='SignInMotoB'
            component={SignInMotoB}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name='SignUpMotoB'
            component={SignUpMotoB}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name='SuccessScreenMotoB'
            component={SuccessScreenMotoB}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name='MotoboyHome'
            component={MotoboyHomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name='MotoboyMap'
            component={MotoboyMapScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name='Ranking'
            component={RankingScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name='Config'
            component={ConfigScreen}
            options={{
              headerShown:false,
            }}
          
          />
          <Stack.Screen 
            name='PagamentoPix'
            component={PagamentoPixScreen}
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
