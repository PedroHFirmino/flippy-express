import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.237.64:3000/api'  
  : 'http://localhost:3000/api'; 

const ConfigScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [token, setToken] = useState(null);


    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
           
            const storedToken = await AsyncStorage.getItem('motoboyToken');
            if (!storedToken) {
                Alert.alert('Erro', 'Usuário não autenticado');
                navigation.navigate('SignInMotoB');
                return;
            }

            setToken(storedToken);

            
            const response = await fetch(`${API_URL}/motoboys/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                const motoboy = data.data;
                setName(motoboy.nome || '');
                setEmail(motoboy.email || '');
                setPhone(motoboy.telefone || '');
            } else {
                console.error('Erro ao carregar perfil:', data.message);
                Alert.alert('Erro', 'Não foi possível carregar os dados do perfil');
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Erro de conexão ao carregar dados');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSave = async () => {
        if (!token) {
            Alert.alert('Erro', 'Usuário não autenticado');
            return;
        }

        if (!name.trim() || !email.trim() || !phone.trim()) {
            Alert.alert('Erro', 'Nome, email e telefone são obrigatórios');
            return;
        }

        setLoading(true);

        try {
            const updateData = {
                nome: name.trim(),
                telefone: phone.trim()
            };

            if (password.trim()) {
                if (password.length < 6) {
                    Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
                    setLoading(false);
                    return;
                }
                updateData.senha = password;
            }

            const response = await fetch(`${API_URL}/motoboys/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
                setPassword(''); 
            } else {
                Alert.alert('Erro', data.message || 'Erro ao atualizar dados');
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            Alert.alert('Erro', 'Erro de conexão ao atualizar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('motoboyToken');
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'SignInMotoB' }],
                            });
                        } catch (error) {
                            console.error('Erro ao fazer logout:', error);
                        }
                    }
                }
            ]
        );
    };

    if (loadingProfile) {
        return (
            <SafeAreaView style={tw`bg-white h-full`}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" type="material" color="black" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Configurações</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00b5f8" />
                    <Text style={styles.loadingText}>Carregando dados...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
            <SafeAreaView style={tw`bg-white h-full`}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" type="material" color="black" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Configurações</Text>
                </View>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.profileContainer}>
                        <Image
                            source={require('../assets/usuario.png')}
                            style={styles.profileImage}
                        />
                        <Text style={styles.profileName}>{name || 'Carregando...'}</Text>
                    </View>
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Nome</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu nome"
                            value={name}
                            onChangeText={setName}
                            editable={!loading}
                        />
                        <Text style={styles.label}>E-mail</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            placeholder="Digite seu e-mail"
                            value={email}
                            editable={false}
                        />
                        <Text style={styles.disabledText}>E-mail não pode ser alterado</Text>
                        <Text style={styles.label}>Telefone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu telefone"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            editable={!loading}
                        />
                        <Text style={styles.label}>Nova Senha (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite sua nova senha"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!loading}
                        />
                        <Text style={styles.optionalText}>Deixe em branco para manter a senha atual</Text>
                        
                        <TouchableOpacity 
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                            )}
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 10,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00b5f8',
        marginBottom: 10,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 20,
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
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#666',
    },
    disabledText: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
        fontStyle: 'italic',
    },
    optionalText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic',
    },
    saveButton: {
        backgroundColor: '#00b5f8',
        padding: 15,
        borderRadius: 10,
        marginTop: 30,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ConfigScreen;