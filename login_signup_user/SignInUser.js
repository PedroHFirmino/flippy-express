import { DefaultTheme } from '@react-navigation/native';
// import React, { useState } from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.237.64:3000/api'  
  : 'http://localhost:3000/api'; 

export default function SignInUser () {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }
        setLoading(true);
        try {
            const loginData = {
                email,
                senha: password
            };
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });
            const data = await response.json();
            if (response.ok && data.success) {
                await AsyncStorage.setItem('userToken', data.data.token);
                if (data.data.user && data.data.user.id) {
                    await AsyncStorage.setItem('userId', String(data.data.user.id));
                }
                Alert.alert(
                    'Sucesso!',
                    'Login realizado com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('HomeScreen')
                        }
                    ]
                );
            } else {
                Alert.alert('Erro', data.message || 'Email ou senha inválidos');
            }
        } catch (error) {
            Alert.alert(
                'Erro de Conexão',
                `Não foi possível conectar ao servidor.\n\nURL tentada: ${API_URL}\n\nVerifique se:\n1. O servidor está rodando\n2. O IP está correto\n3. Ambos estão na mesma rede`
            );
        } finally {
            setLoading(false);
        }
    };
    return (
        <View style={styles.container}>
            <Animatable.View 
                animation="fadeInLeft" delay={500}
                style={styles.containerHeader}>
            <Text style={styles.message}>Login</Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                <Text style={styles.title}>E-mail</Text>
                <TextInput 
                    placeholder="Digite seu E-mail"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"                    
                />

                <Text style={styles.title}>Senha</Text>
                <TextInput 
                    placeholder="Senha"
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Acessar'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => navigation.navigate ('SignUpUsers')}
                    style={styles.buttonRegister}>
                    <Text style={styles.registerText}>Ainda não possui uma conta? Cadastre-se!</Text>

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

    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },

})