import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Picker } from '@react-native-picker/picker';

export default function SignUpUsers() {
  const [selectedGender, setSelectedGender] = useState("");
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
        <Text style={styles.message}>Cadastre-se</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" style={styles.containerForm}>
        <Text style={styles.title}>Nome/Razão Social</Text>
        <TextInput 
          placeholder="Digite seu nome ou Razão Social"
          style={styles.input}
        />

        <Text style={styles.title}>Telefone</Text>
        <TextInput 
          placeholder="Digite seu telefone"
          style={styles.input}
        />

        <Text style={styles.title}>Sexo</Text>
        <Picker
          selectedValue={selectedGender}
          onValueChange={(itemValue) => setSelectedGender(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecione o sexo" value="" />
          <Picker.Item label="Masculino" value="masculino" />
          <Picker.Item label="Feminino" value="feminino" />
          <Picker.Item label="Outro" value="outro" />
          <Picker.Item label="Prefiro não dizer" value="null" />
        </Picker>

        <Text style={styles.title}>CPF/CNPJ</Text>
        <TextInput 
          placeholder="Digite seu CPF ou CNPJ"
          style={styles.input}
        />

        <Text style={styles.title}>Endereço</Text>
        <TextInput 
          placeholder="Digite seu endereço - nº"
          style={styles.input}
        />

        <Text style={styles.title}>CEP</Text>
        <TextInput 
          placeholder="Digite seu CEP"
          style={styles.input}
        />

      <Text style={styles.title}>Cidade</Text>
        <TextInput 
          placeholder="Digite sua cidade"
          style={styles.input}
        />

      <Text style={styles.title}>Estado</Text>
        <TextInput 
          placeholder="Digite seu estado"
          style={styles.input}
        />

        <Text style={styles.title}>E-mail</Text>
        <TextInput 
          placeholder="Digite seu E-mail"
          style={styles.input}
        />

        <Text style={styles.title}>Senha</Text>
        <TextInput 
          placeholder="Digite uma senha"
          style={styles.input}
          secureTextEntry
        />
        <Text style={styles.title}>Confirme sua senha</Text>
        <TextInput 
            placeholder="Confirme sua senha"
            style={styles.input}
            secureTextEntry
        />

        <TouchableOpacity 
          onPress={() => navigation.navigate('SuccessScreenUser')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  containerHeader: {
    marginTop: '14%',
    marginBottom: '8%',
    paddingStart: '5%',
  },
  message: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00b5f8',
  },
  containerForm: {
    flex: 1,
    paddingStart: '5%',
    paddingEnd: '5%',
  },
  title: {
    fontSize: 20,
    marginTop: 20,
  },
  input: {
    borderBottomWidth: 1,
    height: 40,
    marginBottom: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#00b5f8',
    width: '100%',
    borderRadius: 4,
    paddingVertical: 8,
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
