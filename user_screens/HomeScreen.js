import React, { useEffect, useState } from 'react'
import tw, { style } from 'twrnc';
import { StyleSheet, View, SafeAreaView, Image, TouchableOpacity, Alert, Platform, Text, FlatList, Linking } from 'react-native'
import NavOptions from '../user_components/NavOptions';
import LocationAutocomplete from '../user_components/LocationAutocomplete';
import { useDispatch } from 'react-redux';
import { setOrigin, resetNavState } from '../slices/navSlice';
import { Icon } from 'react-native-elements';
import {ProfileScreen} from './ProfileScreen';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.OS === 'android'
  ? 'http://192.168.237.64:3000/api'
  : 'http://localhost:3000/api';

const HomeScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null);
    const [entregasHoje, setEntregasHoje] = useState([]);
    const [showHistorico, setShowHistorico] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(resetNavState());
        getUserId();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (userId) {
                carregarEntregasHoje();
            }
        }, [userId])
    );

    const getUserId = async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            setUserId(id);
        } catch (error) {
            console.error('Erro ao obter userId:', error);
        }
    };

    const carregarEntregasHoje = async () => {
        if (!userId) return;
        
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/pedidos/user/${userId}/hoje`);
            const data = await response.json();
            
            if (data.success) {
                setEntregasHoje(data.data);
            } else {
                setEntregasHoje([]);
            }
        } catch (error) {
            console.error('Erro ao carregar entregas:', error);
            setEntregasHoje([]);
        } finally {
            setLoading(false);
        }
    };

    const contatarMotoboy = async (motoboyId) => {
        try {
            const response = await fetch(`${API_URL}/motoboys/${motoboyId}`);
            const data = await response.json();
            
            if (data.success && data.data && data.data.telefone) {
                const telefone = data.data.telefone.replace(/\D/g, '');
                const url = `whatsapp://send?phone=55${telefone}&text=Olá! Sou o cliente. Como está a entrega?`;
                
                Linking.canOpenURL(url).then(supported => {
                    if (supported) {
                        Linking.openURL(url);
                    } else {
                        Alert.alert('Erro', 'WhatsApp não está instalado');
                    }
                });
            } else {
                Alert.alert('Erro', 'Telefone do motoboy não disponível');
            }
        } catch (error) {
            Alert.alert('Erro', 'Erro ao buscar dados do motoboy');
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pendente':
                return 'Aguardando Motoboy';
            case 'aceito':
                return 'Aceito pelo Motoboy';
            case 'em_andamento':
                return 'Em Andamento';
            case 'entregue':
                return 'Entregue';
            case 'cancelado':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendente':
                return '#ff9500';
            case 'aceito':
                return '#007AFF';
            case 'em_andamento':
                return '#00b5f8';
            case 'entregue':
                return '#34C759';
            case 'cancelado':
                return '#FF3B30';
            default:
                return '#666';
        }
    };

    


    const handleLocationSelect = (locationData) => {
        dispatch(setOrigin({
            location: locationData.location,
            description: locationData.description
        }));
    };

    const renderEntrega = ({ item }) => (
        <View style={styles.entregaCard}>
            <View style={styles.entregaHeader}>
                <Text style={styles.entregaTitle}>
                    {item.descricao_item || 'Entrega'} #{item.id}
                </Text>
                <Text style={[styles.entregaStatus, { color: getStatusColor(item.status) }]}>
                    {getStatusText(item.status)}
                </Text>
            </View>
            
            <View style={styles.entregaInfo}>
                <Text style={styles.entregaText}>
                    <Text style={styles.label}>Origem:</Text> {item.origem_endereco || 'Não informado'}
                </Text>
                <Text style={styles.entregaText}>
                    <Text style={styles.label}>Destino:</Text> {item.destino_endereco || 'Não informado'}
                </Text>
                <Text style={styles.entregaText}>
                    <Text style={styles.label}>Valor:</Text> R$ {item.valor ? Number(item.valor).toFixed(2) : '0.00'}
                </Text>
                <Text style={styles.entregaText}>
                    <Text style={styles.label}>Data:</Text> {item.data_pedido ? new Date(item.data_pedido).toLocaleDateString('pt-BR') : 'Não informado'}
                </Text>
            </View>

            {item.motoboy_id && (
                <TouchableOpacity
                    style={styles.contatoButton}
                    onPress={() => contatarMotoboy(item.motoboy_id)}
                >
                    <Icon name="whatsapp" type="font-awesome" color="white" size={16} />
                    <Text style={styles.contatoButtonText}>Contatar Motoboy</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={tw`bg-white h-full`}>
            <View style={tw`p-5`}>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress = { () => navigation.navigate ('ProfileScreen')}>
                        <Icon
                            name="user"
                            type="antdesign"
                            color="black"
                            size={24}>           
                        </Icon>

                </TouchableOpacity>

                <Image
                    source={require('../assets/Logo.png')}
                    style={{ 
                        width: 250, 
                        height: 150, 
                        resizeMode: "contain",
                    }}
                />

                <View style={styles.autocompleteContainer}>
                    <LocationAutocomplete onLocationSelect={handleLocationSelect} />
                </View>

                <NavOptions />

                <TouchableOpacity
                    style={styles.historicoButton}
                    onPress={() => setShowHistorico(!showHistorico)}>
                    <Icon
                        name="clock"
                        type="feather"
                        color="white"
                        size={20}>           
                    </Icon>
                    <Text style={styles.historicoButtonText}>Histórico de Entregas</Text>
                </TouchableOpacity>

                {showHistorico && (
                    <View style={styles.historicoContainer}>
                        <View style={styles.historicoHeader}>
                            <Text style={styles.historicoTitle}>Entregas de Hoje</Text>
                            <TouchableOpacity onPress={() => setShowHistorico(false)}>
                                <Icon name="x" type="feather" color="#666" size={20} />
                            </TouchableOpacity>
                        </View>
                        
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Carregando...</Text>
                            </View>
                        ) : entregasHoje.length > 0 ? (
                            <FlatList
                                data={entregasHoje}
                                renderItem={renderEntrega}
                                keyExtractor={(item) => item.id.toString()}
                                showsVerticalScrollIndicator={false}
                                style={styles.entregasList}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Nenhuma entrega hoje</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    autocompleteContainer: {
        marginVertical: 10,
        zIndex: 1,
    },
    profileButton: {
        position: 'absolute',
        top: 75,
        right: 20,
        zIndex: 1,
        padding: 8,
    },
    historicoButton: {
        backgroundColor: '#00b5f8',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    historicoButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 8,
    },
    historicoContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        paddingBottom: 0,
    },
    historicoHeader: {
        backgroundColor: 'white',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginTop: 50,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 15,
    },
    historicoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    entregasList: {
        backgroundColor: 'white',
        flex: 1,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    entregaCard: {
        backgroundColor: 'white',
        marginVertical: 8,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    entregaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    entregaTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    entregaStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    entregaInfo: {
        marginBottom: 10,
    },
    entregaText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
        lineHeight: 18,
    },
    label: {
        fontWeight: 'bold',
        color: '#333',
    },
    contatoButton: {
        backgroundColor: '#25D366',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginTop: 5,
    },
    contatoButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 5,
    },
    loadingContainer: {
        backgroundColor: 'white',
        flex: 1,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        backgroundColor: 'white',
        flex: 1,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});