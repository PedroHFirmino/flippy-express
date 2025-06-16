import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import LocationAutocomplete from './LocationAutocomplete';
import {GOOGLE_MAPS_API_KEY} from '@env';
import { TextInput } from 'react-native-web';
import { useDispatch } from 'react-redux';
import { setDestination } from '../slices/navSlice';
import { useNavigation } from '@react-navigation/native';

const NavigateCard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Olá Pedro</Text>
      <View style={tw `border-t border-gray-200 flex-shrink`}>
      <View>
      <LocationAutocomplete 
        placeholder="Para onde?"
        // styles ={boxStyle}
        fetchDetails={true}
        enablePoweredByContaines={false}
        returnKeyType={"search"}
        minLenght={2}
        onPress ={(data, details = null) => {
          dispatch(
            setDestination({
            location: details.geometry.location,
            description: data.description,
          })
        );
          navigation.navigate('buscaOpcoesCard')
        }}
        nearbyPlacesAPI='GooglePlacesSearch'
        debounce={400}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'pt',
        }}
        />
      </View>
      </View>
    </SafeAreaView>
  );
};

export default NavigateCard;

// const boxStyle = StyleSheet.create({
//   container: {
//     backgroundColor:"white",
//     paddingTop: 20,
//     flex:0,

//   },
//   textInput: {
//     backgroundColor:"#DDDDDF",
//     borderRadius:0,
//     fontSize:18,

//   }

// });

const styles = StyleSheet.create({
  text:{
    textAlign:'center',
    paddingTop: 5,
  },

});

