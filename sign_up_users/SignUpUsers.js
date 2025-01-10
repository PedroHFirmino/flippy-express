import { DefaultTheme, useNavigation } from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity	} from 'react-native';
import { style } from 'twrnc';
import * as Animatable from 'react-native-animatable'

export default function SignUpUsers () {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Animatable.View 
                animation="fadeInLeft" delay={500}
                style={styles.containerHeader}>
            <Text style={styles.message}>Cadastre-se</Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" style={styles.containerForm}>

            <Text style={styles.title}>Nome/Razão Social</Text>
                <TextInput 
                    placeholder="Digite seu nome ou Razão Social"
                    style={styles.input}
                />

                
            <Text style={styles.title}>CPF/CNPJ</Text>
                <TextInput 
                    placeholder="Digite seu CPF ou CNPJ"
                    style={styles.input}
                />

                <Text style={styles.title}>E-mail</Text>
                <TextInput 
                    placeholder="Digite seu E-mail"
                    style={styles.input}
                />

                <Text style={styles.title}>Senha</Text>
                <TextInput 
                    placeholder="Digite uma senha"
                    style={styles.input}
                />

                <TouchableOpacity 
                        onPress={() => navigation.navigate ('HomeScreen') }
                        style={styles.button}>
                    
                    <Text style={styles.buttonText}>Cadastrar</Text>

                </TouchableOpacity>



            </Animatable.View>
            
        </View>
    );

}

const styles = StyleSheet.create ({
    container:{
        flex:1,
        backgroundColor: 'white',

    },
    containerHeader:{
        marginTop:'14%',
        marginBottom:'8%',
        paddingStart:'5%',
    },
    message:{
        fontSize:28,
        fontWeight:'bold',
        color:'#00b5f8'
    },
    containerForm:{
        // backgroundColor:'#00b5f8',
        flex:1,
        paddingStart:'5%',
        paddingEnd:'5%',
    },
    title:{
        fontSize:20,
        marginTop:20,
    },
    input:{
        borderBottomWidth:1,
        height:40,
        marginBottom:12,
        fontSize:16,
    },
    button:{
        backgroundColor:'#00b5f8',
        width:'100%',
        borderRadius:4,
        paddingVertical:8,
        marginTop:14,
        justifyContent: 'center',
        alignItems:'center'

    },

    buttonText:{
        color:'white',
        fontSize:18,
        fontWeight:'bold',
    },
    buttonRegister:{
        marginTop: 20,
        alignSelf:'center',

    },

    registerText:{

    }


})