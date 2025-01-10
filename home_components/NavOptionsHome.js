import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity, FlatList, Image, } from 'react-native'
import { Icon } from 'react-native-elements';
import tw from 'twrnc';


const data = [
    {
        id:"123",
        title: "Comida",
        image: require('../assets/food.png'),
        screen: "Mapa",

},

{
    id:"456",
    title: "Encomenda",
    image: require('../assets/package.png'),
    screen: "Mapa",

},




];

const NavOptionsHome = () => {
    const navigation = useNavigation();
    return (
        <FlatList
           data={data}
           horizontal
           keyExtractor={(item)=>item.id}
           renderItem={({item}) => (
                <TouchableOpacity 
                    onPress={() => navigation.navigate (item.screen) }
                    style={tw`p-2 pl-6 pb-8 pt-4 bg-gray-200 m-2 w-40`}>                
                    <View>
                        <Image
                            style = {{
                                width:100,
                                height: 100,
                                resizeMode: "contain",
                            }}
                            source={item.image} /> 
                        <Text style={tw`mt-2 font-semibold`} >{item.title}</Text>
                        <Icon
                            style={[tw`p-2 rounded-full w-10 mt-4`, { backgroundColor: '#00b5f8' }]}
                            name= 'arrowright' 
                            color="white" 
                            type="antdesign"
                        
                        />                    
                    </View>
                </TouchableOpacity>
           )}
    />
    );
};

export default NavOptionsHome

const style = StyleSheet.create ({})