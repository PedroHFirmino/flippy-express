import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.237.64:3000/api'  
  : 'http://localhost:3000/api'; 

const SolicitarSaqueScreen = () => {
    const navigation = useNavigation();
    const [nome, setNome] = useState('');
    const [chavePix, setChavePix] = useState('');
    const [banco, setBanco] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

    const handleSubmit = async () => {
        if (!nome.trim() || !chavePix.trim() || !banco.trim()) {
            Alert.alert('Erro', 'Todos os campos são obrigatórios');
            return;
        }

        setLoading(true);

        try {
            const storedToken = await AsyncStorage.getItem('motoboyToken');
            if (!storedToken) {
                Alert.alert('Erro', 'Usuário não autenticado');
                navigation.navigate('SignInMotoB');
                return;
            }

            const response = await fetch(`${API_URL}/motoboys/solicitar-saque`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome.trim(),
                    chavePix: chavePix.trim(),
                    banco: banco.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Sucesso', 'Solicitação de saque enviada com sucesso!');
                setNome('');
                setChavePix('');
                setBanco('');
                navigation.goBack();
            } else {
                Alert.alert('Erro', data.message || 'Erro ao enviar solicitação');
            }
        } catch (error) {
            console.error('Erro ao enviar solicitação:', error);
            Alert.alert('Erro', 'Erro de conexão ao enviar solicitação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={tw`bg-white h-full`}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" type="material" color="black" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Solicitar Saque</Text>
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.formContainer}>
                    <Text style={styles.description}>
                        Preencha os dados para solicitar o saque dos seus ganhos
                    </Text>
                    
                    <Text style={styles.label}>Nome Completo</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu nome completo"
                        value={nome}
                        onChangeText={setNome}
                        editable={!loading}
                    />

                    <Text style={styles.label}>Chave PIX</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua chave PIX"
                        value={chavePix}
                        onChangeText={setChavePix}
                        editable={!loading}
                    />

                    <Text style={styles.label}>Banco</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite o nome do banco"
                        value={banco}
                        onChangeText={setBanco}
                        editable={!loading}
                    />

                    <TouchableOpacity 
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.submitButtonText}>Enviar Solicitação</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    submitButton: {
        backgroundColor: '#00b5f8',
        padding: 15,
        borderRadius: 10,
        marginTop: 30,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default SolicitarSaqueScreen; 