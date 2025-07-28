import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Platform.OS === 'android'
  ? 'http://192.168.237.64:3000/api'
  : 'http://localhost:3000/api';

const AguardandoMotoboyScreen = ({ navigation }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getUserId();
  }, []);

    const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    } catch (error) {
      console.error('Erro ao obter userId:', error);
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color="#00b5f8" style={{ marginBottom: 20 }} />
        <Text style={styles.titulo}>Aguardando motoboy...</Text>
        <Text style={styles.texto}>Seu pedido foi registrado e está aguardando um motoboy aceitar a entrega.</Text>
        <TouchableOpacity style={styles.botao} onPress={() => navigation.navigate('HomeScreen')}>
          <Text style={styles.textoBotao}>Voltar para o início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00b5f8',
    marginBottom: 16,
  },
  texto: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  botao: {
    backgroundColor: '#00b5f8',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AguardandoMotoboyScreen; 