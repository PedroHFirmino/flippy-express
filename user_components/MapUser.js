import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, {Marker} from "react-native-maps";
import { useSelector } from "react-redux";
import tw from 'twrnc';
import { selectOrigin } from "../slices/navSlice";

const MapUser = () => {
    const origin = useSelector(selectOrigin);

   
    return (
        <MapView 
        style={{ flex: 1/2 }}

        initialRegion={{
          latitude: origin.location.lat,
          longitude: origin.location.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
            }}    
            onMapReady={() => console.log("Mapa carregado!")}
            onError={(error) => console.error("Erro ao carregar o mapa:", error)}
        >
            {origin?.location && (
                <Marker 
                    coordinate={{
                        latitude: origin.location.lat,
                        longitude: origin.location.lng,
                    }}
                    title="Origem"
                    description={origin.description}
                    identifier="origem"
                />
            )}
        </MapView>
    );
};

export default MapUser

const styles = StyleSheet.create({})