import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

const MotoboyMapScreen = () => {
  const [location, setLocation] = useState(null);
  const [deliveryRequest, setDeliveryRequest] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentDestination, setCurrentDestination] = useState(null);
  const navigation = useNavigation();

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

  const simulateDeliveryRequest = () => {
    setDeliveryRequest({
      id: '1',
      pickup: {
        latitude: location.coords.latitude + 0.01,
        longitude: location.coords.longitude + 0.01,
        address: 'Ponto de coleta'
      },
      delivery: {
        latitude: location.coords.latitude + 0.02,
        longitude: location.coords.longitude + 0.02,
        address: 'Ponto de entrega'
      },
      value: 'R$ 25,00'
    });
  };

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

      {!deliveryRequest && (
        <TouchableOpacity
          style={styles.simulateButton}
          onPress={simulateDeliveryRequest}
        >
          <Text style={styles.buttonText}>Simular Entrega</Text>
        </TouchableOpacity>
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
});

export default MotoboyMapScreen; 