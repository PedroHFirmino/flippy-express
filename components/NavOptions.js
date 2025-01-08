import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity, FlatList, Image } from 'react-native'
import tw from 'twrnc';


const data = [
    {
        id:"123",
        title: "Solicite um Motoboy",
        image: require('../assets/motoboy.png'),
        // screen "Mapa",

},




];

const NavOptions = () => {
    return (
        <FlatList
           data={data}
           horizontal
           keyExtractor={(item)=>item.id}
           renderItem={({item}) => (
                <TouchableOpacity style={tw`p-2 pl-6 pb-8 pt-4 bg-gray-200 m-2 w-40`}>
                    <View style={{ alignItems: 'center' }}>
                        <Image
                            style = {{
                                width:100,
                                height: 100,
                                resizeMode: "contain",
                            }}
                            source={item.image} /> 
                        <Text style={tw`mt-1 font-semibold`} >{item.title}</Text>                    
                    </View>
                </TouchableOpacity>
           )}
    />
    );
};

export default NavOptions

const style = StyleSheet.create ({})