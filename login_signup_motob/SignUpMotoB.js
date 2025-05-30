import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from 'react-native';

export default function SignUpMotoB() {

  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');

  const handleCadastro = () => {

    if (
      !nome ||
      !selectedGender ||
      !cpf ||
      !telefone ||
      !nascimento ||
      !endereco ||
      !cep ||
      !cidade ||
      !estado ||
      !email ||
      !senha ||
      !confirmSenha
    ) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos!');
      return;
    }

  
    if (senha !== confirmSenha) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

  
    navigation.navigate('SuccessScreenMotoB');
  };


  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
        <Text style={styles.message}>Cadastre-se</Text>
      </Animatable.View>

<ScrollView style={{flex:1}}
            contentContainerStyle={{ paddingBottom: 50 }}>
      <Animatable.View animation="fadeInUp" style={styles.containerForm}>
        <Text style={styles.title}>Nome Completo</Text>
        <TextInput 
          placeholder="Digite seu nome"
          style={styles.input}
          onChange={setNome}
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
        </Picker>

        <Text style={styles.title}>CPF</Text>
        <TextInput 
          placeholder="Digite seu CPF"
          style={styles.input}
          onChangeText={setCpf}
        />
        <Text style={styles.title}>Telefone</Text>
        <TextInput 
          placeholder="Digite seu telefone"
          style={styles.input}
          onChangeText={setTelefone}
        />
        <Text style={styles.title}>Data de Nascimento</Text>
        <TextInput 
          placeholder="Digite sua data de nascimento"
          style={styles.input}
          onChangeText={setNascimento}
        />
        <Text style={styles.title}>Endereço</Text>
        <TextInput 
          placeholder="Digite seu endereço - nº"
          style={styles.input}
          onChangeText={setEndereco}
        />

        <Text style={styles.title}>CEP</Text>
        <TextInput 
          placeholder="Digite seu CEP"
          style={styles.input}
          onChangeText={setCep}
        />

      <Text style={styles.title}>Cidade</Text>
        <TextInput 
          placeholder="Digite sua cidade"
          style={styles.input}
          onChangeText={setCidade}
        />

      <Text style={styles.title}>Estado</Text>
        <TextInput 
          placeholder="Digite seu estado"
          style={styles.input}
          onChangeText={setEstado}
        />        

        <Text style={styles.title}>E-mail</Text>
        <TextInput 
          placeholder="Digite seu E-mail"
          style={styles.input}
          onChangeText={setEmail}
        />

        <Text style={styles.title}>Senha</Text>
        <TextInput 
          placeholder="Digite uma senha"
          style={styles.input}
          onChangeText={setSenha}
          secureTextEntry
        />
        <Text style={styles.title}>Confirme sua senha</Text>
        <TextInput 
          placeholder="Confirme sua senha"
          style={styles.input}
          onChangeText={setConfirmSenha}
          secureTextEntry
        />
      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={handleCadastro}
          style={styles.button}
        >
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
      </Animatable.View>
      </ScrollView>
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
    width: '70%',
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
