import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import * as Animatable from 'react-native-animatable';


const estabelecimentoData = [
  {
    id: "123",
    title: "Estabelecimento",
    image: require('../assets/estabelecimento.png'),
    screen: "SignInUser", 
  }
];

const motoboyData = [
  {
    id: "456",
    title: "Motoboy",
    image: require('../assets/motoboy.png'),
    screen: "SignInMotoB", 
  }
];

const NavOptionsHome = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Estabelecimento */}
      <FlatList
        data={estabelecimentoData}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('SignInUser')} 
            style={tw`p-2 pl-5 pb-8 pt-4 bg-gray-200 m-2 w-40`}>
            <View>
              <Animatable.View animation="fadeInRight" delay={500}>
                <Image
                  style={{
                    width: 100,
                    height: 100,
                    resizeMode: "contain",
                  }}
                  source={item.image}
                />
                <Text style={tw`mt-2 font-semibold`}>{item.title}</Text>
                <Icon
                  style={[tw`p-2 rounded-full w-10 mt-4`, { backgroundColor: '#00b5f8' }]}
                  name="arrowright"
                  color="white"
                  type="antdesign"
                />
              </Animatable.View>
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={false} 
      />

      {/* Motoboy */}
      <FlatList
        data={motoboyData}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('SignInMotoB')} 
            style={tw`p-2 pl-5 pb-8 pt-4 bg-gray-200 m-2 w-40`}>
            <View>
              <Animatable.View animation="fadeInRight" delay={500}>
                <Image
                  style={{
                    width: 100,
                    height: 100,
                    resizeMode: "contain",
                  }}
                  source={item.image}
                />
                <Text style={tw`mt-2 font-semibold`}>{item.title}</Text>
                <Icon
                  style={[tw`p-2 rounded-full w-10 mt-4`, { backgroundColor: '#00b5f8' }]}
                  name="arrowright"
                  color="white"
                  type="antdesign"
                />
              </Animatable.View>
            </View>
          </TouchableOpacity>
        )}
        scrollEnabled={false} 
      />
    </View>

    
  );
};

export default NavOptionsHome;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingLeft:5,
  },
});
