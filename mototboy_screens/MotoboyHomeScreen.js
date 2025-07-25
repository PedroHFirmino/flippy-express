import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Image, TouchableOpacity, Text, Alert, FlatList, Platform } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import tw from 'twrnc';
import RankingScreen from '../motoboy_components/RankingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.OS === 'android'
  ? 'http://192.168.237.64:3000/api'
  : 'http://localhost:3000/api';

const MotoboyHomeScreen = () => {
    const navigation = useNavigation();
    const [online, setOnline] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [pedidos, setPedidos] = useState([]);
    const [loadingPedidos, setLoadingPedidos] = useState(false);
    const [motoboyId, setMotoboyId] = useState(null);
    const [entregasHoje, setEntregasHoje] = useState(0);
    const [ganhosHoje, setGanhosHoje] = useState(0);

    useEffect(() => {
        // Recuperar ID do motoboy do token (simples, pode ser melhorado)
        const getMotoboyId = async () => {
            const token = await AsyncStorage.getItem('motoboyToken');
            if (!token) return;
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setMotoboyId(payload.id);
            } catch (e) {}
        };
        getMotoboyId();
    }, []);

    useEffect(() => {
        let interval;
        if (online) {
            fetchPedidosPendentes();
            interval = setInterval(fetchPedidosPendentes, 10000); // 10 segundos
        } else {
            setPedidos([]);
        }
        return () => interval && clearInterval(interval);
    }, [online]);

    // Atualizar stats e ranking ao focar na tela
    useFocusEffect(
      React.useCallback(() => {
        const fetchStats = async () => {
          if (!motoboyId) return;
          try {
            const API_URL = Platform.OS === 'android'
              ? 'http://192.168.237.64:3000/api'
              : 'http://localhost:3000/api';
            const response = await fetch(`${API_URL}/motoboys/${motoboyId}/stats-dia`);
            const data = await response.json();
            if (data.success) {
              setEntregasHoje(data.data.entregasHoje || 0);
              setGanhosHoje(data.data.ganhosHoje || 0);
            }
          } catch (e) {}
        };
        fetchStats();

      }, [motoboyId])
    );

    const fetchPedidosPendentes = async () => {
        setLoadingPedidos(true);
        try {
            const response = await fetch(`${API_URL}/pedidos/pendentes`);
            const data = await response.json();
            if (data.success) {
                setPedidos(data.data);
                console.log('Pedidos pendentes:', data.data);
            } else {
                setPedidos([]);
            }
        } catch (e) {
            setPedidos([]);
        } finally {
            setLoadingPedidos(false);
        }
    };

    const handleToggleStatus = async () => {
        let id = motoboyId;
        if (!id) {
            const token = await AsyncStorage.getItem('motoboyToken');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    id = payload.id;
                    setMotoboyId(id);
                } catch (e) {
                    Alert.alert('Erro', 'Não foi possível identificar o motoboy. Faça login novamente.');
                    return;
                }
            }
        }
        if (!id) {
            Alert.alert('Erro', 'ID do motoboy não encontrado. Faça login novamente.');
            return;
        }
        setLoadingStatus(true);
        try {
            const novoStatus = online ? 'offline' : 'online';
            console.log('Enviando PATCH para status:', novoStatus, 'motoboyId:', id);
            const response = await fetch(`${API_URL}/motoboys/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });
            const data = await response.json();
            console.log('Resposta do backend ao atualizar status:', data);
            if (data.success) {
                setOnline(!online);
            } else {
                Alert.alert('Erro', data.message || 'Erro ao atualizar status');
            }
        } catch (e) {
            Alert.alert('Erro', 'Erro de conexão ao atualizar status');
        } finally {
            setLoadingStatus(false);
        }
    };

    const handleAceitarPedido = async (pedidoId) => {
        if (!motoboyId) {
            Alert.alert('Erro', 'ID do motoboy não encontrado. Faça login novamente.');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/pedidos/${pedidoId}/aceitar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motoboy_id: motoboyId })
            });
            const data = await response.json();
            if (data.success) {
                // Buscar o pedido aceito do backend
                const pedidoResp = await fetch(`${API_URL}/pedidos/${pedidoId}`);
                const pedidoData = await pedidoResp.json();
                if (pedidoData.success && pedidoData.data) {
                    navigation.navigate('EntregaEmAndamento', { pedido: pedidoData.data });
                } else {
                    Alert.alert('Erro', 'Não foi possível carregar os dados do pedido.');
                }
                setPedidos(pedidos.filter(p => p.id !== pedidoId));
            } else {
                Alert.alert('Erro', data.message || 'Erro ao aceitar pedido');
                fetchPedidosPendentes();
            }
        } catch (e) {
            Alert.alert('Erro', 'Erro de conexão ao aceitar pedido');
        }
    };

    const renderPedido = ({ item }) => (
        <View style={styles.pedidoBox}>
            <Text style={styles.pedidoTitle}>Pedido #{item.id}</Text>
            <Text>Origem: {item.origem_endereco}</Text>
            <Text>Destino: {item.destino_endereco}</Text>
            <Text>Valor: R$ {item.valor?.toFixed(2)}</Text>
            <Text>Status: {item.status}</Text>
            <TouchableOpacity
                style={styles.aceitarButton}
                onPress={() => handleAceitarPedido(item.id)}
            >
                <Text style={styles.aceitarButtonText}>Aceitar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={tw`bg-white h-full`}>
            <View style={tw`p-5`}>
                <Image
                    source={require('../assets/Logo.png')}
                    style={{
                        width: 250,
                        height: 150,
                        resizeMode: "contain",
                    }}
                />

                <View style={styles.statusContainer}>
                    <Text style={styles.statusTitle}>Status</Text>
                    <View style={styles.statusIndicator}>
                        <Icon
                            name="circle"
                            type="font-awesome"
                            color={online ? "#4CAF50" : "#F44336"}
                            size={12}
                        />
                        <Text style={styles.statusText}>{online ? 'Online' : 'Offline'}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: online ? '#F44336' : '#00b5f8' }]}
                        onPress={handleToggleStatus}
                        disabled={loadingStatus}
                    >
                        <Text style={styles.startButtonText}>
                            {loadingStatus ? 'Aguarde...' : online ? 'Encerrar Trabalho' : 'Iniciar Trabalho'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Removido: exibição das solicitações pendentes aqui */}

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{entregasHoje}</Text>
                        <Text style={styles.statLabel}>Entregas Hoje</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            R$ {typeof ganhosHoje === 'number' ? ganhosHoje.toFixed(2) : (Number(ganhosHoje) ? Number(ganhosHoje).toFixed(2) : '0,00')}
                        </Text>
                        <Text style={styles.statLabel}>Ganhos Hoje</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.startButton, { opacity: online ? 1 : 0.5 }]}
                    onPress={() => {
                        if (online) {
                            navigation.navigate('MotoboyMap');
                        } else {
                            Alert.alert('Atenção', 'Você precisa estar online para ver entregas.');
                        }
                    }}
                    disabled={!online}
                >
                    <Text style={styles.startButtonText}>Ir ao Mapa</Text>
                </TouchableOpacity>

                {/* Campanha da semana */}
                <View style={styles.campanhaContainer}>
                    <Text style={styles.campanhaTitulo}>Campanha da semana:</Text>
                    <Text style={styles.campanhaDescricao}>Vale uma troca de óleo.</Text>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Ranking')}>
                        <Icon
                            name="leaderboard"
                            type="material"
                            color="#00b5f8"
                            size={24}
                        />
                        <Text style={styles.menuText}>Ranking</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon
                            name="attach-money"
                            type="material"
                            color="#00b5f8"
                            size={24}
                        />
                        <Text style={styles.menuText}>Ganhos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Config')}>
                
                        <Icon
                            name="settings"
                            type="material"
                            color="#00b5f8"
                            size={24}
                        />
                        <Text style={styles.menuText}>Configurações</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.withdrawButton}
                    onPress={() => navigation.navigate('SolicitarSaque')}>
                    <Text style={styles.withdrawButtonText}>Solicitar Saque</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    profileButton: {
        position: 'absolute',
        top: 75,
        right: 20,
        zIndex: 1,
        padding: 8,
    },
    statusContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#4CAF50',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00b5f8',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    startButton: {
        backgroundColor: '#00b5f8',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    withdrawButton: {
        backgroundColor: '#00b5f8',
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
        alignItems: 'center',
    },
    withdrawButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
    },
    menuItem: {
        alignItems: 'center',
    },
    menuText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    campanhaContainer: {
        marginTop: 20,
        marginBottom: 3,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
    },
    campanhaTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#00b5f8',
        marginBottom: 4,
    },
    campanhaDescricao: {
        fontSize: 15,
        color: '#333',
    },
    pedidosContainer: {
        marginTop: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 15,
    },
    pedidosTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#00b5f8',
    },
    pedidoBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        elevation: 2,
    },
    pedidoTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    aceitarButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    aceitarButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default MotoboyHomeScreen; 