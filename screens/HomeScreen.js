import React from 'react'
import tw from 'twrnc';
import { StyleSheet, Text, View, SafeAreaView, Image } from 'react-native'

const HomeScreen = () => {
    return (
        <SafeAreaView style={tw`bg-white-900 h-full`}>
            <View style={tw `p-5`}>
                <Image
                    source={require('../assets/Logo.png')}
                    style={{ 
                        width: 200, 
                        height: 150, 
                        resizeMode: "contain",
                        marginLeft: -50,
                    }}
                />
            {/* <Text style={tw`text-blue-500 p-10`}>Flippy</Text> */}
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