import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.237.64:3000/api'  
  : 'http://localhost:3000/api'; 

const RankingScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('semanal'); 
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRanking();
    }, [selectedPeriod]);

    const loadRanking = async () => {
        setLoading(true);
        try {
            const url = `${API_URL}/motoboys/ranking?periodo=${selectedPeriod}`;
            console.log('🔍 Carregando ranking:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Status da resposta:', response.status);
            const data = await response.json();
            console.log('Dados recebidos:', data);

            if (response.ok) {
                const rankingData = data.data || [];
                
               
                const processedData = rankingData.map(item => ({
                    ...item,
                    total_entregas: item.total_entregas || 0,
                    avaliacao_media: item.avaliacao_media || 0,
                    total_ganhos: item.total_ganhos || 0,
                    posicao: item.posicao || 0
                }));
                
                setRankingData(processedData);
                console.log(`Ranking carregado: ${processedData.length} motoboys`);
            } else {
                console.error('Erro ao carregar ranking:', data.message);
                Alert.alert('Erro', `Não foi possível carregar o ranking: ${data.message}`);
            }
        } catch (error) {
            console.error(' Erro de conexão:', error);
            Alert.alert('Erro', 'Erro de conexão ao carregar ranking. Verifique se o servidor está rodando.');
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
    };

    const renderRankingItem = ({ item, index }) => (
        <View style={[
            styles.rankingItem,
            index === 0 && styles.firstPlace,
            index === 1 && styles.secondPlace,
            index === 2 && styles.thirdPlace
        ]}>
            <View style={styles.positionContainer}>
                <Text style={styles.positionText}>{item.posicao}º</Text>
            </View>
            <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{item.nome}</Text>
                <Text style={styles.deliveryCount}>{item.total_entregas || 0} entregas</Text>
                <Text style={styles.ratingText}> {item.avaliacao_media ? parseFloat(item.avaliacao_media).toFixed(1) : '0.0'}</Text>
                <Text style={styles.earningsText}>R$ {item.total_ganhos ? parseFloat(item.total_ganhos).toFixed(2) : '0.00'}</Text>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon
                name="emoji-events"
                type="material"
                color="#ccc"
                size={64}
            />
            <Text style={styles.emptyText}>Nenhum motoboy encontrado</Text>
            <Text style={styles.emptySubtext}>Ainda não há dados de entregas para este período</Text>
        </View>
    );

    return (
        <SafeAreaView style={tw`bg-white h-full`}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Icon
                        name="arrow-back"
                        type="material"
                        color="black"
                        size={24}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ranking</Text>
            </View>

            <View style={styles.periodSelector}>
                <TouchableOpacity
                    style={[styles.periodButton, selectedPeriod === 'semanal' && styles.selectedPeriod]}
                    onPress={() => handlePeriodChange('semanal')}>
                    <Text style={[styles.periodText, selectedPeriod === 'semanal' && styles.selectedPeriodText]}>
                        Semana
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.periodButton, selectedPeriod === 'mensal' && styles.selectedPeriod]}
                    onPress={() => handlePeriodChange('mensal')}>
                    <Text style={[styles.periodText, selectedPeriod === 'mensal' && styles.selectedPeriodText]}>
                        Mês
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.periodButton, selectedPeriod === 'anual' && styles.selectedPeriod]}
                    onPress={() => handlePeriodChange('anual')}>
                    <Text style={[styles.periodText, selectedPeriod === 'anual' && styles.selectedPeriodText]}>
                        Ano
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00b5f8" />
                    <Text style={styles.loadingText}>Carregando ranking...</Text>
                </View>
            ) : (
                <FlatList
                    data={rankingData}
                    renderItem={renderRankingItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderEmptyState}
                    refreshing={loading}
                    onRefresh={loadRanking}
                />
            )}
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
    periodSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    periodButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    selectedPeriod: {
        backgroundColor: '#00b5f8',
    },
    periodText: {
        color: '#666',
        fontWeight: '500',
    },
    selectedPeriodText: {
        color: 'white',
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
    listContainer: {
        padding: 15,
        flexGrow: 1,
    },
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    firstPlace: {
        backgroundColor: '#FFD700',
    },
    secondPlace: {
        backgroundColor: '#C0C0C0',
    },
    thirdPlace: {
        backgroundColor: '#CD7F32',
    },
    positionContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    positionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    driverInfo: {
        flex: 1,
    },
    driverName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    deliveryCount: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    ratingText: {
        fontSize: 12,
        color: '#FFA500',
        marginTop: 2,
    },
    earningsText: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 2,
        fontWeight: 'bold',
    },
});

export default RankingScreen;