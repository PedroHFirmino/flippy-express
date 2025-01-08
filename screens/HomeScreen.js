import React from 'react'
import tw from 'twrnc';
import { StyleSheet, Text, View, SafeAreaView, Image } from 'react-native'
import NavOptions from '../components/NavOptions';

const HomeScreen = () => {
    return (
        <SafeAreaView style={tw`bg-white-900 h-full`}>
            <View style={tw `p-5`}>
                <Image
                    source={require('../assets/Logo.png')}
                    style={{ 
                        width: 250, 
                        height: 150, 
                        resizeMode: "contain",

                    }}
                />

                <NavOptions></NavOptions>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen

const styles = StyleSheet.create ({
    text: {
        color: 'blue',
    },
});