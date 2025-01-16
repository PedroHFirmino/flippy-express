import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, {Marker} from "react-native-maps";
import tw from 'twrnc';

const MapUser = () => {
    return (
        <MapView 
        style={{ flex: 1/2 }}
        initialRegion={{
          latitude: -24.0430,
          longitude: -52.3796,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
            }}    
            onMapReady={() => console.log("Mapa carregado!")}
            onError={(error) => console.error("Erro ao carregar o mapa:", error)}
        />
    )
}

export default MapUser

const styles = StyleSheet.create({})