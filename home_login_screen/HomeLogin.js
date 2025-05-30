import { DefaultTheme, useNavigation } from '@react-navigation/native';
import React, { useRef } from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { style } from 'twrnc';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';


export default function HomeLogin () {
    const navigation=useNavigation();

    const ExitAlert = () => {
        Alert.alert(
            "Sair do Aplicativo",
            "Tem certeza que deseja sair do App?",
            [
                {
                    text: "Cancelar",
                    style: "cancelar"
                    
                },
                {
                    text: "Sair",
                    onPress: () => BackHandler.exitApp(),
                    style: "sair"
                }
                
            ],
            {cancelable: false}
        );

    };


    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.exitButton}
                onPress={ExitAlert}>
                <Icon
                    name="close"
                        type="antdesign"
                        color="#666"
                        size={24}
                    />
                </TouchableOpacity>

            <View style={styles.containerLogo}>
                <Animatable.Image
                    animation="flipInY"
                    source={require('../assets/LogoIcon.png')}
                    style={{
                        width:'100%',
                        height: '100%',
                        resizeMode:"contain",
                    }}
                />
            </View>
            <Animatable.View
                animation="fadeInUp"
                delay={600}
                style={styles.containerForm}>

                <Text style={styles.title}>Bem-vindo(a)</Text>
                <Text style={styles.text}>Faça login para começar</Text>

                <TouchableOpacity style={styles.button}
                    onPress={ () => navigation.navigate('HomeChoice')}>
                    <Text style={styles.buttonText}>Começar!</Text>
                </TouchableOpacity>
            </Animatable.View>
        </View>
    );

}

const styles =StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: 'white'

    },
    containerLogo:{
        flex:2,
        backgroundColor: 'white',
        justifyContent:'center',
        alignItems:'center'
    },
    containerForm:{
        flex:1,
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingStart: '5%',
        paddingEnd:'5%'
    },
    title:{
        fontSize:24,
        fontWeight: 'bold',
        marginTop: 28,
        marginBottom:12,
    },
    text:{
        color: '#a1a1a1'

    },
    button:{
        position:'absolute',
        backgroundColor: '#00b5f8',   
        borderRadius: 50,
        paddingVertical: 8,
        width:'60%',
        alignSelf:'center',
        bottom:'15%',
        alignItems:'center',
        justifyContent:'center',
    },
    buttonText:{
        color: 'white',
        fontSize:15,
        fontWeight:'bold',
    },
        exitButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
        padding: 8,
    }
});