import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import * as Animatable from 'react-native-animatable';
// import { defaultSerializeQueryArgs } from '@reduxjs/toolkit/query';


export default function ProfileScreen () {
    return(
        <View style={styles.container}>
          <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
                <Text style={styles.title}>Meu Perfil</Text>
          </Animatable.View>
          <Image 
            source={require('../assets/usuario.png')}
              style={{
                width: 250,
                height: 150,
                alignItems: 'center',
                resizeMode: 'contain',
                top: 100,
                
              }}
          ></Image>

          <Animatable.View>
            <Text style = {styles.nome}> Pedro H. Firmino</Text>
            
          </Animatable.View>
            </View>
    );

}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  title: {
    top: 75,
    fontSize: 20,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#00b5f8',
    },

  nome: {
    top: 120,
    fontSize: 20,
    textAlign: 'center',
    

  }

})