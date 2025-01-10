import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

export default function SuccessScreen() {
  const [messageIndex, setMessageIndex] = useState(0); 
  const [showButton, setShowButton] = useState(false); 
  const messages = [
    "Cadastro realizado com sucesso!",
    "Seja bem-vindo(a) ao Flipy Express!",
    "Agora você pode começar a usar!"
  ];
  const navigation = useNavigation();

  useEffect(() => {
    const messageInterval = setTimeout(() => {
      setMessageIndex(1); 
    }, 4000); 

    const secondMessageInterval = setTimeout(() => {
      setMessageIndex(2); 
    }, 6000); 

    
    const showButtonTimeout = setTimeout(() => {
      setShowButton(true); 
    }, 7000); 

    return () => {
      clearTimeout(messageInterval);
      clearTimeout(secondMessageInterval);
      clearTimeout(showButtonTimeout);
    };
  }, []);

  return (
    <Animatable.View animation="fadeIn" duration={900} style={styles.container}>

      {messageIndex > 0 && (
        <Animatable.View animation="fadeOut" duration={900}>
          <Text style={styles.message}>{messages[messageIndex - 1]}</Text>
        </Animatable.View>
      )}

      <Animatable.View animation="fadeIn" duration={1000} delay={1000}>
        <Text style={styles.message}>{messages[messageIndex]}</Text>
      </Animatable.View>

      {showButton && (
        <Animatable.View animation="fadeIn" duration={1000} delay={1000}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Início')}>
            <Text style={styles.buttonText}>Fazer Login</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00b5f8',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#00b5f8',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
