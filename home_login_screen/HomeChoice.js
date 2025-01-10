import React from 'react'
import tw from 'twrnc';
import { StyleSheet, Text, View, SafeAreaView, Image,  } from 'react-native'
import NavOptions from '../home_components/NavOptionsHome';
import * as Animatable from 'react-native-animatable';




const HomeChoice = () => {
    return (
        <SafeAreaView style={tw`bg-white-900 h-full`}>
            <View style={tw `p-5`}>
                <Animatable.View
                animation="fadeInLeft" delay={100}>
                <Image
                    source={require('../assets/Logo.png')}
                    style={{ 
                        width: 250, 
                        height: 150, 
                        resizeMode: "contain",
                        paddingStart: '5%',
                        paddingEnd:'5%',
                        
                    }}
                />
                </Animatable.View>

                <Animatable.View
                    animation="fadeInLeft" delay={100}>
                <Text style={styles.title}>Eu sou:</Text>
                </Animatable.View>
                <NavOptions />
            </View>
        </SafeAreaView>
    );
};

export default HomeChoice

const styles = StyleSheet.create ({
    text: {
        color: 'blue',
    },

    title:{

        fontSize:28,
        fontWeight:'bold',
        color:'#00b5f8',
        paddingBottom:20,
        paddingStart: '2%',
        paddingEnd:'5%'
        },
});

