import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import NavigateCard from '../user_components/NavigateCard';
import buscaOpcoesCard from '../user_components/buscaOpcoesCard';

const Stack = createStackNavigator();

const MapScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="NavigateCard" component={NavigateCard} />
        <Stack.Screen name="buscaOpcoesCard" component={buscaOpcoesCard} />
      </Stack.Navigator>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({});