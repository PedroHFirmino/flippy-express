import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Platform, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef } from 'react';

const API_URL = Platform.OS === 'android'
  ? 'http://192.168.237.64:3000/api'
  : 'http://localhost:3000/api';

const MotoboyMapScreen = () => {
  const [location, setLocation] = useState(null);
  const [deliveryRequest, setDeliveryRequest] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentDestination, setCurrentDestination] = useState(null);
  const [online, setOnline] = useState(false);
  const [motoboyId, setMotoboyId] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const prevPedidosLength = useRef(0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da sua localização para continuar.');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    // Recuperar status e id do motoboy
    const getMotoboyInfo = async () => {
      const token = await AsyncStorage.getItem('motoboyToken');
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setMotoboyId(payload.id);
        setOnline(payload.status === 'online'); 
      } catch (e) {}
    };
    getMotoboyInfo();
  }, []);

  useEffect(() => {
    
    if (route.params && typeof route.params.online === 'boolean') {
      setOnline(route.params.online);
    }
  }, [route.params]);

  useEffect(() => {
    fetchPedidosPendentes();
    const interval = setInterval(fetchPedidosPendentes, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (online && pedidos.length > 0) {
      Alert.alert('Nova Entrega Disponível!', 'Há uma nova entrega aguardando motoboy.');
    }
  }, [pedidos, online]);

  useEffect(() => {
    if (pedidos.length > prevPedidosLength.current) {
      Alert.alert('Nova Entrega Disponível!', 'Há uma nova entrega aguardando motoboy.');
    }
    prevPedidosLength.current = pedidos.length;
  }, [pedidos]);

  const fetchPedidosPendentes = async () => {
    setLoadingPedidos(true);
    try {
      console.log('Chamando endpoint:', `${API_URL}/pedidos/pendentes`);
      const response = await fetch(`${API_URL}/pedidos/pendentes`);
      const data = await response.json();
      if (data.success) {
        setPedidos(data.data);
      } else {
        setPedidos([]);
      }
    } catch (e) {
      setPedidos([]);
      console.log('Erro ao buscar pedidos pendentes:', e);
    } finally {
      setLoadingPedidos(false);
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
        Alert.alert('Sucesso', 'Pedido aceito com sucesso!');
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

  const calculateRoute = async (origin, destination) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      const data = await response.json();

      if (data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const coords = decodePolyline(points);
        setRouteCoordinates(coords);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      return false;
    }
  };

  const decodePolyline = (encoded) => {
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;
    const coordinates = [];

    while (index < len) {
      let shift = 0;
      let result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push({
        latitude: lat / 1E5,
        longitude: lng / 1E5
      });
    }

    return coordinates;
  };

  const handleAcceptDelivery = async () => {
    if (location && deliveryRequest) {
      // Calcular rota até o ponto de coleta
      const success = await calculateRoute(
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        deliveryRequest.pickup
      );

      if (success) {
        setCurrentDestination('pickup');
        Alert.alert(
          'Entrega aceita',
          'Você aceitou a entrega. Siga a rota até o ponto de coleta.',
          [
            {
              text: 'OK',
              onPress: () => {
                
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível calcular a rota. Tente novamente.');
      }
    }
  };

  const handleRejectDelivery = () => {
    Alert.alert(
      'Entrega rejeitada',
      'Você rejeitou a entrega.',
      [
        {
          text: 'OK',
          onPress: () => {
            setDeliveryRequest(null);
            setRouteCoordinates([]);
            setCurrentDestination(null);
          }
        }
      ]
    );
  };

  const handleArrivedAtPickup = async () => {
    if (deliveryRequest) {
      // Calcular rota até o ponto de entrega
      const success = await calculateRoute(
        deliveryRequest.pickup,
        deliveryRequest.delivery
      );

      if (success) {
        setCurrentDestination('delivery');
        Alert.alert(
          'Ponto de coleta',
          'Você chegou ao ponto de coleta. Siga a rota até o ponto de entrega.',
          [
            {
              text: 'OK',
              onPress: () => {
                
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível calcular a rota. Tente novamente.');
      }
    }
  };

  const handleArrivedAtDelivery = () => {
    Alert.alert(
      'Entrega concluída',
      'Você chegou ao ponto de entrega. Entrega concluída com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => {
            setDeliveryRequest(null);
            setRouteCoordinates([]);
            setCurrentDestination(null);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Sua localização"
          />
          {deliveryRequest && (
            <>
              <Marker
                coordinate={{
                  latitude: deliveryRequest.pickup.latitude,
                  longitude: deliveryRequest.pickup.longitude,
                }}
                title="Ponto de coleta"
                pinColor="green"
              />
              <Marker
                coordinate={{
                  latitude: deliveryRequest.delivery.latitude,
                  longitude: deliveryRequest.delivery.longitude,
                }}
                title="Ponto de entrega"
                pinColor="red"
              />
            </>
          )}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor="#00b5f8"
            />
          )}
        </MapView>
      )}

      {/* Espaço fixo na parte de baixo para pedidos */}
      {pedidos.length > 0 && (
        <View style={styles.bottomBox}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={[styles.pedidoInfoBox, styles.novoPedidoBox]}>
              <Text style={styles.pedidoTitle}>Nova Entrega Disponível!</Text>
              <Text style={styles.pedidoLabel}>Origem:</Text>
              <Text style={styles.pedidoValue}>{pedidos[0]?.origem_endereco || '---'}</Text>
              <Text style={styles.pedidoLabel}>Destino:</Text>
              <Text style={styles.pedidoValue}>{pedidos[0]?.destino_endereco || '---'}</Text>
              <Text style={styles.pedidoLabel}>Valor:</Text>
              <Text style={styles.pedidoValue}>
                R$ {typeof pedidos[0]?.valor === 'number' ? pedidos[0].valor.toFixed(2) : (Number(pedidos[0]?.valor) ? Number(pedidos[0].valor).toFixed(2) : '---')}
              </Text>
              <View style={styles.pedidoButtonRow}>
                <TouchableOpacity
                  style={[styles.aceitarButton, { flex: 1, marginRight: 8 }]}
                  onPress={() => handleAceitarPedido(pedidos[0].id)}
                >
                  <Text style={styles.aceitarButtonText}>Aceitar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.recusarButton, { flex: 1, marginLeft: 8 }]}
                  onPress={() => setPedidos(pedidos.slice(1))}
                >
                  <Text style={styles.recusarButtonText}>Recusar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Exibir solicitações pendentes apenas se online */}
      {online && (
        <View style={styles.pedidosContainer}>
          <Text style={styles.pedidosTitle}>Solicitações Pendentes</Text>
          {loadingPedidos ? (
            <Text>Carregando pedidos...</Text>
          ) : pedidos.length === 0 ? (
            <Text>Nenhum pedido pendente no momento.</Text>
          ) : (
            <FlatList
              data={pedidos}
              keyExtractor={item => item.id.toString()}
              renderItem={renderPedido}
            />
          )}
        </View>
      )}

      {deliveryRequest && !currentDestination && (
        <View style={styles.deliveryRequestContainer}>
          <Text style={styles.deliveryRequestTitle}>Nova entrega disponível!</Text>
          <Text style={styles.deliveryRequestText}>
            Valor: {deliveryRequest.value}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={handleAcceptDelivery}
            >
              <Text style={styles.buttonText}>Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={handleRejectDelivery}
            >
              <Text style={styles.buttonText}>Recusar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {currentDestination === 'pickup' && (
        <TouchableOpacity
          style={[styles.button, styles.arrivedButton]}
          onPress={handleArrivedAtPickup}
        >
          <Text style={styles.buttonText}>Cheguei ao ponto de coleta</Text>
        </TouchableOpacity>
      )}

      {currentDestination === 'delivery' && (
        <TouchableOpacity
          style={[styles.button, styles.arrivedButton]}
          onPress={handleArrivedAtDelivery}
        >
          <Text style={styles.buttonText}>Cheguei ao ponto de entrega</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  simulateButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  deliveryRequestContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  deliveryRequestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deliveryRequestText: {
    fontSize: 16,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  arrivedButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#00b5f8',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pedidosContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  pedidosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00b5f8',
  },
  pedidoBox: {
    backgroundColor: '#f8f9fa',
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
  bottomBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: 'white',
    padding: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    elevation: 10,
    alignItems: 'center',
    zIndex: 20,
    justifyContent: 'flex-start',
  },
  bottomText: {
    fontSize: 18,
    color: '#00b5f8',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pedidoInfoBox: {
    width: '100%',
    alignItems: 'flex-start',
  },
  pedidoLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginTop: 6,
  },
  pedidoValue: {
    color: '#444',
    fontSize: 16,
    marginBottom: 2,
  },
  pedidoButtonRow: {
    flexDirection: 'row',
    marginTop: 16,
    width: '100%',
  },
  recusarButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  recusarButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  novoPedidoBox: {
    borderWidth: 2,
    borderColor: '#00b5f8',
    backgroundColor: '#e0f7fa',
  },
});

export default MotoboyMapScreen; 