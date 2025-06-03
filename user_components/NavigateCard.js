import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import LocationAutocomplete from './LocationAutocomplete';
import {GOOGLE_MAPS_API_KEY} from '@env';

const NavigateCard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Olá Pedro</Text>
      <View style={tw `border-t border-gray-200 flex-shrink`}>
      <View>
      <LocationAutocomplete 
        placeholder="Para onde?"
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

const styles = StyleSheet.create({
  text:{
    textAlign:'center',
    paddingTop: 5,
  },

});

