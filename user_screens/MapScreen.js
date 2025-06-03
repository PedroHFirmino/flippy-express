import React from 'react'
import tw from 'twrnc';
import { StyleSheet, Text, View, SafeAreaView, Image } from 'react-native'
import MapUser from '../user_components/MapUser';
import NavigateCard from '../user_components/NavigateCard';
import { createStackNavigator } from '@react-navigation/stack';
import buscaOpcoesCard from '../user_components/buscaOpcoesCard';



const MapScreen = () => {
    const Stack = createStackNavigator();

    return (
        <View>
            <View style={tw`h-1/2`}>
                <MapUser />
        </View>
        <View style={tw`h-1/2`}>
            <Stack.Navigator>
             <Stack.Screen
                name="NavigateCard"
                component={NavigateCard}
                options={{
                    headerShown: false,
                }} 
                />
             <Stack.Screen
                name="buscaOpcoesCard"
                component={buscaOpcoesCard}
                options={{
                    headerShown: false,
                }} 
                />                 
                 
            </Stack.Navigator>
        </View>
        </View>


    );
};

export default MapScreen;

const styles = StyleSheet.create ({});