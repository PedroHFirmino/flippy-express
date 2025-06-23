import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { selectOrigin, selectDestination } from '../slices/navSlice';
import { GOOGLE_MAPS_APIKEY } from '@env';

const BuscaOpcoesCard = () => {
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const [itemDescription, setItemDescription] = useState('');
  const [error, setError] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const valorSimulado = 'R$ 25,00';

  useEffect(() => {
    const fetchRoute = async () => {
      if (!origin || !destination) return;
      setLoading(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.location.lat || origin.location.latitude},${origin.location.lng || origin.location.longitude}&destination=${destination.location.lat || destination.location.latitude},${destination.location.lng || destination.location.longitude}&key=${GOOGLE_MAPS_APIKEY}&language=pt-BR`);
        const data = await response.json();
        if (data.status === 'OK') {
          const leg = data.routes[0].legs[0];
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text
          });
        } else {
          setRouteInfo(null);
        }
      } catch (e) {
        setRouteInfo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [origin, destination]);

  const handleConfirm = () => {
    if (!itemDescription.trim()) {
      setError('A descrição do item é obrigatória.');
      return;
    }
    setError('');
    Alert.alert('Pedido enviado!', `Item: ${itemDescription}\nOrigem: ${origin?.description}\nDestino: ${destination?.description}`);
  
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo da Entrega</Text>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Origem:</Text>
        <Text style={styles.value}>{origin?.description || 'Não selecionado'}</Text>
        <Text style={styles.label}>Destino:</Text>
        <Text style={styles.value}>{destination?.description || 'Não selecionado'}</Text>
        <Text style={styles.label}>Valor:</Text>
        <Text style={styles.value}>{valorSimulado}</Text>
        {loading ? (
          <ActivityIndicator color="#00b5f8" style={{marginTop: 10}} />
        ) : routeInfo && (
          <View style={styles.routeBox}>
            <Text style={styles.routeText}>Distância: {routeInfo.distance}</Text>
            <Text style={styles.routeText}>Tempo estimado: {routeInfo.duration}</Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>Descrição do item a ser entregue *</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        value={itemDescription}
        onChangeText={setItemDescription}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirmar Pedido</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BuscaOpcoesCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fb',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00b5f8',
    marginBottom: 18,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  value: {
    color: '#444',
    fontSize: 16,
    marginBottom: 2,
  },
  routeBox: {
    marginTop: 10,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    padding: 10,
  },
  routeText: {
    color: '#0077b6',
    fontSize: 15,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#00b5f8',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    marginTop: -4,
    fontSize: 14,
  },
});
