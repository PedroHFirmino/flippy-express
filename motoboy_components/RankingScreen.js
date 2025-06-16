import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, FlatList, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

const RankingScreen = () => {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week', 'month', 'year'

    
    const rankingData = [
        { id: '1', name: 'João Silva', deliveries: 45, position: 1 },
        { id: '2', name: 'Maria Santos', deliveries: 42, position: 2 },
        { id: '3', name: 'Pedro Oliveira', deliveries: 38, position: 3 },
        { id: '4', name: 'Ana Costa', deliveries: 35, position: 4 },
        { id: '5', name: 'Carlos Souza', deliveries: 32, position: 5 },
    ];

    const renderRankingItem = ({ item, index }) => (
        <View style={[
            styles.rankingItem,
            index === 0 && styles.firstPlace,
            index === 1 && styles.secondPlace,
            index === 2 && styles.thirdPlace
        ]}>
            <View style={styles.positionContainer}>
                <Text style={styles.positionText}>{item.position}º</Text>
            </View>
            <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{item.name}</Text>
                <Text style={styles.deliveryCount}>{item.deliveries} entregas</Text>
            </View>
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
                    style={[styles.periodButton, selectedPeriod === 'week' && styles.selectedPeriod]}
                    onPress={() => setSelectedPeriod('week')}>
                    <Text style={[styles.periodText, selectedPeriod === 'week' && styles.selectedPeriodText]}>
                        Semana
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.periodButton, selectedPeriod === 'month' && styles.selectedPeriod]}
                    onPress={() => setSelectedPeriod('month')}>
                    <Text style={[styles.periodText, selectedPeriod === 'month' && styles.selectedPeriodText]}>
                        Mês
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.periodButton, selectedPeriod === 'year' && styles.selectedPeriod]}
                    onPress={() => setSelectedPeriod('year')}>
                    <Text style={[styles.periodText, selectedPeriod === 'year' && styles.selectedPeriodText]}>
                        Ano
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={rankingData}
                renderItem={renderRankingItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
            />
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
    listContainer: {
        padding: 15,
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

});

export default RankingScreen; 