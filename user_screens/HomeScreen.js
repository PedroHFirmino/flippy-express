import React, { useEffect } from 'react'
import tw, { style } from 'twrnc';
import { StyleSheet, View, SafeAreaView, Image, TouchableOpacity } from 'react-native'
import NavOptions from '../user_components/NavOptions';
import LocationAutocomplete from '../user_components/LocationAutocomplete';
import { useDispatch } from 'react-redux';
import { setOrigin, resetNavState } from '../slices/navSlice';
import { Icon } from 'react-native-elements';
import {ProfileScreen} from './ProfileScreen';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation ();

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
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress = { () => navigation.navigate ('ProfileScreen')}>
                        <Icon
                            name="user"
                            type="antdesign"
                            color="black"
                            size={24}>           
                        </Icon>

                </TouchableOpacity>
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
    },
    profileButton: {
        position: 'absolute',
        top: 75,
        right: 20,
        zIndex: 1,
        padding: 8,
    }
});