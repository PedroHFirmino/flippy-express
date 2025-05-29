import React, { useEffect } from 'react'
import tw from 'twrnc';
import { StyleSheet, View, SafeAreaView, Image } from 'react-native'
import NavOptions from '../user_components/NavOptions';
import LocationAutocomplete from '../user_components/LocationAutocomplete';
import { useDispatch } from 'react-redux';
import { setOrigin, resetNavState } from '../slices/navSlice';

const HomeScreen = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(resetNavState());
    }, []);

    const handleLocationSelect = (locationData) => {
        dispatch(setOrigin({
            location: locationData.location,
            description: locationData.description
        }));
    };

    return (
        <SafeAreaView style={tw`bg-white h-full`}>
            <View style={tw`p-5`}>
                <Image
                    source={require('../assets/Logo.png')}
                    style={{ 
                        width: 250, 
                        height: 150, 
                        resizeMode: "contain",
                    }}
                />

                <View style={styles.autocompleteContainer}>
                    <LocationAutocomplete onLocationSelect={handleLocationSelect} />
                </View>

                <NavOptions />
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    autocompleteContainer: {
        marginVertical: 10,
        zIndex: 1,
    }
});