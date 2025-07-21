import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { selectOrigin, selectDestination } from '../slices/navSlice';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import { calcularValorEntrega } from '../src/utils/priceCalculator';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BuscaOpcoesCard = () => {
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const [itemDescription, setItemDescription] = useState('');
  const [error, setError] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [valorEntrega, setValorEntrega] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRoute = async () => {
      if (!origin || !destination) {
        console.log('Origem ou destino não definidos.');
        return;
      }
      console.log('Origem:', JSON.stringify(origin, null, 2));
      console.log('Destino:', JSON.stringify(destination, null, 2));

      setLoading(true);
      setValorEntrega(null); // Limpar valor anterior

      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.location.lat || origin.location.latitude},${origin.location.lng || origin.location.longitude}&destination=${destination.location.lat || destination.location.latitude},${destination.location.lng || destination.location.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`;
        console.log('Buscando rota da URL:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        console.log('Resposta da API do Google:', JSON.stringify(data, null, 2));

        if (data.status === 'OK' && data.routes && data.routes.length > 0) {
          const leg = data.routes[0].legs[0];
          console.log('Dados da Rota (leg):', JSON.stringify(leg, null, 2));

          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text
          });
          setRouteCoords(decodePolyline(data.routes[0].overview_polyline.points));
          
          const distanciaEmMetros = leg.distance.value;
          console.log('Distância em metros:', distanciaEmMetros);

          if (distanciaEmMetros > 0) {
            const distanciaKm = distanciaEmMetros / 1000;
            const resultado = calcularValorEntrega(distanciaKm);
            console.log('Resultado do cálculo:', JSON.stringify(resultado, null, 2));
            setValorEntrega(resultado.valor_total);
          } else {
            console.log('Distância não é maior que zero.');
            setValorEntrega(null);
          }
        } else {
          console.log('Erro na resposta da API:', data.status, data.error_message);
          setRouteInfo(null);
          setRouteCoords([]);
          setValorEntrega(null);
        }
      } catch (e) {
        console.error('Erro ao buscar rota:', e);
        setRouteInfo(null);
        setRouteCoords([]);
        setValorEntrega(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRoute();
  }, [origin, destination]);

  
  function decodePolyline(encoded) {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  }

  const handleConfirm = () => {
    if (!itemDescription.trim()) {
      setError('A descrição do item é obrigatória.');
      return;
    }
    setError('');
    navigation.navigate('PagamentoPix');
  };

  // Região inicial do mapa
  const initialRegion = origin && origin.location ? {
    latitude: origin.location.lat || origin.location.latitude,
    longitude: origin.location.lng || origin.location.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          region={initialRegion}
        >
          {origin && origin.location && (
            <Marker
              coordinate={{
                latitude: origin.location.lat || origin.location.latitude,
                longitude: origin.location.lng || origin.location.longitude,
              }}
              title="Origem"
              pinColor="green"
            />
          )}
          {destination && destination.location && (
            <Marker
              coordinate={{
                latitude: destination.location.lat || destination.location.latitude,
                longitude: destination.location.lng || destination.location.longitude,
              }}
              title="Destino"
              pinColor="red"
            />
          )}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={5}
              strokeColor="#00b5f8"
            />
          )}
        </MapView>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Resumo da Entrega</Text>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Origem:</Text>
          <Text style={styles.value}>{origin?.description || 'Não selecionado'}</Text>
          <Text style={styles.label}>Destino:</Text>
          <Text style={styles.value}>{destination?.description || 'Não selecionado'}</Text>
          <Text style={styles.label}>Valor:</Text>
          <Text style={styles.value}>
            {loading
              ? 'Calculando...'
              : valorEntrega !== null
                ? `R$ ${valorEntrega.toFixed(2)}`
                : 'Calcule a rota'}
          </Text>
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
      </ScrollView>
    </View>
  );
};

export default BuscaOpcoesCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fb',
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.35,
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#e6f7ff',
    elevation: 2,
  },
  map: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
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
