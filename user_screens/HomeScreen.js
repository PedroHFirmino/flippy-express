import React from 'react'
import tw from 'twrnc';
import { StyleSheet, Text, View, SafeAreaView, Image,  } from 'react-native'
import NavOptions from '../user_components/NavOptions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_APIKEY} from "@env";
import 'react-native-get-random-values';
import { useDispatch } from 'react-redux';
import { setDestination, setOrigin } from '../slices/navSlice';




const HomeScreen = () => {
    const dispatch = useDispatch();

    return (
        <SafeAreaView style={tw`bg-white-900 h-full`}>
            <View style={tw `p-5`}>
                <Image
                    source={require('../assets/Logo.png')}
                    style={{ 
                        width: 250, 
                        height: 150, 
                        resizeMode: "contain",

                    }}
                />

                <GooglePlacesAutocomplete
                    placeholder="Localização" 
                    styles={{
                        container: {
                            flex: 0,

                        },
                        textInput: {
                            fontSize: 18,
                        }
                    }}
                    onPress={(data, details =null ) => {
                        dispatch(setOrigin({
                            location: details.geometry.location,
                            description: data.description


                        }))

                        dispatch(setDestination(null));

                    }}
                    fetchDetails={true}
                    returnKeyType={"Procurar"}
                    enablePoweredByContainer={false}
                    minLength={2}
                    query={{
                        key: GOOGLE_MAPS_APIKEY,
                        language: "pt",
                    }}
                    nearbyPlacesAPI="GooglePlacesSearch"
                    debounce={400}
                    onFail={(error) => console.error('Autocomplete Error:', error)}
                />

                <NavOptions />
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen

const styles = StyleSheet.create ({
    text: {
        color: 'blue',
    },
});