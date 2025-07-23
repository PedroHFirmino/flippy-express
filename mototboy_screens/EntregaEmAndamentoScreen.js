import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const EntregaEmAndamentoScreen = ({ route, navigation }) => {
  const { pedido } = route.params;
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar rota entre origem e destino usando Google Directions API
    const fetchRoute = async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pedido.origem_latitude},${pedido.origem_longitude}&destination=${pedido.destino_latitude},${pedido.destino_longitude}&key=YOUR_GOOGLE_MAPS_API_KEY&language=pt-BR`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK') {
          const points = data.routes[0].overview_polyline.points;
          setRouteCoords(decodePolyline(points));
        }
      } catch (e) {}
      setLoading(false);
    };
    fetchRoute();
  }, [pedido]);

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

  const finalizarEntrega = async () => {
    try {
      setLoading(true);
      // Atualizar status do pedido para 'entregue' no backend
      const API_URL = Platform.OS === 'android'
        ? 'http://192.168.237.64:3000/api'
        : 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/pedidos/${pedido.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'entregue', motoboy_id: pedido.motoboy_id })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Entrega finalizada!', 'A entrega foi concluída com sucesso.');
        navigation.navigate('MotoboyHome');
      } else {
        Alert.alert('Erro', data.message || 'Erro ao finalizar entrega.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Erro de conexão ao finalizar entrega.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: pedido.origem_latitude,
            longitude: pedido.origem_longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{ latitude: pedido.origem_latitude, longitude: pedido.origem_longitude }}
            title="Origem"
            pinColor="green"
          />
          <Marker
            coordinate={{ latitude: pedido.destino_latitude, longitude: pedido.destino_longitude }}
            title="Destino"
            pinColor="red"
          />
          {routeCoords.length > 0 && (
            <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="#00b5f8" />
          )}
        </MapView>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.titulo}>Entrega em Andamento</Text>
        <Text style={styles.label}>Origem:</Text>
        <Text style={styles.value}>{pedido.origem_endereco}</Text>
        <Text style={styles.label}>Destino:</Text>
        <Text style={styles.value}>{pedido.destino_endereco}</Text>
        <Text style={styles.label}>Valor:</Text>
        <Text style={styles.value}>R$ {typeof pedido.valor === 'number' ? pedido.valor.toFixed(2) : (Number(pedido.valor) ? Number(pedido.valor).toFixed(2) : '---')}</Text>
        <TouchableOpacity style={styles.botao} onPress={finalizarEntrega} disabled={loading}>
          <Text style={styles.textoBotao}>{loading ? 'Finalizando...' : 'Finalizar Entrega'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fb',
  },
  mapContainer: {
    height: '45%',
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
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 18,
    shadowColor: '#00b5f8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00b5f8',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    color: '#0077b6',
    marginTop: 10,
    fontSize: 16,
  },
  value: {
    color: '#333',
    fontSize: 16,
    marginBottom: 2,
    marginLeft: 8,
  },
  botao: {
    backgroundColor: '#00b5f8',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default EntregaEmAndamentoScreen; 