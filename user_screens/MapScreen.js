import React from 'react'
import tw from 'twrnc';
import { StyleSheet, Text, View, SafeAreaView, Image } from 'react-native'
import MapUser from '../user_components/MapUser';
import MapView from 'react-native-maps';



const MapScreen = () => {
    return (
            <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>

                <MapUser />
                
                    </View>
            </View>

    );
};

export default MapScreen

const styles = StyleSheet.create ({});