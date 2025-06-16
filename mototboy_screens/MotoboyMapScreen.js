import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

const MotoboyMapScreen = () => {
  const [location, setLocation] = useState(null);
  const [deliveryRequest, setDeliveryRequest] = useState(null);
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

  const handleAcceptDelivery = () => {
    Alert.alert(
      'Entrega aceita',
      'Você aceitou a entrega. Boa viagem!',
      [
        {
          text: 'OK',
          onPress: () => {
            setDeliveryRequest(null);
            
          }
        }
      ]
    );
  };

  const handleRejectDelivery = () => {
    Alert.alert(
      'Entrega rejeitada',
      'Você rejeitou a entrega.',
      [
        {
          text: 'OK',
          onPress: () => setDeliveryRequest(null)
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

      {deliveryRequest && (
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
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default MotoboyMapScreen; 