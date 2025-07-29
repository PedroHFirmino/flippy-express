import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

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
    const [valorSemana, setValorSemana] = useState(0);

    // Buscar valor da semana ao montar a tela
    useEffect(() => {
      const fetchValorSemana = async () => {
        try {
          const storedToken = await AsyncStorage.getItem('motoboyToken');
          if (!storedToken) return;
          const API_URL = Platform.OS === 'android'
            ? 'http://192.168.237.64:3000/api'
            : 'http://localhost:3000/api';
          const response = await fetch(`${API_URL}/motoboys/valor-semana`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          const data = await response.json();
          if (data.success) setValorSemana(data.data.valorSemana || 0);
        } catch (e) {}
      };
      fetchValorSemana();
    }, []);

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

            // Montar mensagem para WhatsApp
            const mensagem = `Solicitação de Saque\nNome: ${nome}\nChave Pix: ${chavePix}\nBanco: ${banco}\nValor disponível na semana: R$ ${typeof valorSemana === 'number' ? valorSemana.toFixed(2) : (Number(valorSemana) ? Number(valorSemana).toFixed(2) : '0,00')}`;
            const numeroWhatsapp = '5544998522858'; 
            const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
            Linking.openURL(url);
            setLoading(false);
            Alert.alert('Sucesso', 'Solicitação enviada via WhatsApp!');
            navigation.goBack();
        } catch (error) {
            setLoading(false);
            Alert.alert('Erro', 'Erro ao abrir o WhatsApp');
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

                    {/* <Text style={styles.label}>Valor disponível na semana</Text>
                    <View style={styles.input} pointerEvents="none">
                      <Text style={{ fontSize: 16, color: '#333' }}>
                        R$ {typeof valorSemana === 'number' ? valorSemana.toFixed(2) : (Number(valorSemana) ? Number(valorSemana).toFixed(2) : '0,00')}
                      </Text>
                    </View> */}

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