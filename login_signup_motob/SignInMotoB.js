import { DefaultTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useNavigation } from '@react-navigation/native';


const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.237.64:3000/api'  
  : 'http://localhost:3000/api'; 

export default function SignInMotoB () {
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

            console.log('Tentando login com:', `${API_URL}/motoboys/login`);
            console.log('Dados:', { email, senha: '***' });

            const response = await fetch(`${API_URL}/motoboys/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();
            console.log('Resposta da API:', data);

            if (response.ok) {
 
                
                Alert.alert(
                    'Sucesso!', 
                    'Login realizado com sucesso!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('MotoboyHome')
                        }
                    ]
                );
            } else {
                Alert.alert('Erro', data.message || 'Email ou senha inválidos');
            }

        } catch (error) {
            console.error('Erro na requisição:', error);
            Alert.alert(
                'Erro de Conexão', 
                `Não foi possível conectar ao servidor.\n\nURL tentada: ${API_URL}\n\nVerifique se:\n1. O servidor está rodando\n2. O IP está correto\n3. Ambos estão na mesma rede`,
                [
                    { text: 'OK' },
                    { 
                        text: 'Testar Conexão', 
                        onPress: () => testConnection() 
                    }
                ]
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
                    secureTextEntry
                />

                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}>
                    <Text style={styles.buttonText}>
                        {loading ? 'Entrando...' : 'Acessar'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => navigation.navigate('SignUpMotoB')}
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
    buttonDisabled: {
        backgroundColor: '#ccc',
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