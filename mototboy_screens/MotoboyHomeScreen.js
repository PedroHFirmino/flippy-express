import React from 'react';
import { StyleSheet, View, SafeAreaView, Image, TouchableOpacity, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import RankingScreen from '../motoboy_components/RankingScreen';

const MotoboyHomeScreen = () => {
    const navigation = useNavigation();

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
                            color="#4CAF50"
                            size={12}
                        />
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Entregas Hoje</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>R$ 0,00</Text>
                        <Text style={styles.statLabel}>Ganhos Hoje</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => navigation.navigate('MotoboyMap')}>
                    <Text style={styles.startButtonText}>Iniciar Trabalho</Text>
                </TouchableOpacity>

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
});

export default MotoboyHomeScreen; 