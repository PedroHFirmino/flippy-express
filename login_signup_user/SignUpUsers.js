import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Picker } from '@react-native-picker/picker';


const API_URL = Platform.OS === 'android' 
  ? 'http://192.168.237.64:3000/api' 
  : 'http://localhost:3000/api'; 

export default function SignUpUsers() {
  const [selectedGender, setSelectedGender] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();

  const handleCadastro = async () => {
    // Validações básicas
    if (!nome || !telefone || !cpfCnpj || !endereco || !cep || !cidade || !estado || !email || !senha || !confirmSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos!');
      return;
    }

    if (senha !== confirmSenha) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        nome,
        telefone,
        sexo: selectedGender,
        cpf_cnpj: cpfCnpj,
        endereco,
        cep,
        cidade,
        estado,
        email,
        senha
      };

      console.log('Tentando conectar com:', `${API_URL}/users/register`);
      console.log('Dados:', userData);

      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      console.log('Resposta da API:', data);

      if (response.ok) {
        Alert.alert(
          'Sucesso!', 
          'Usuário cadastrado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('SuccessScreenUser')
            }
          ]
        );
      } else {
        Alert.alert('Erro', data.message || 'Erro ao cadastrar usuário');
      }

    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert(
        'Erro de Conexão', 
        `Não foi possível conectar ao servidor.\n\nURL tentada: ${API_URL}\n\nVerifique se:\n1. O servidor está rodando\n2. O IP está correto\n3. Ambos estão na mesma rede`,
        [
          { text: 'OK' },
          { 
            text: 'Testar Conexão', 
            onPress: () => testConnection() 
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const testUrl = `${API_URL.replace('/api', '')}/ping`;
      console.log('Testando conexão com:', testUrl);
      
      const response = await fetch(testUrl);
      const data = await response.json();
      
      Alert.alert('Conexão OK!', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      Alert.alert('Conexão Falhou', `Erro: ${error.message}\n\nURL: ${API_URL.replace('/api', '')}/ping`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.container}>
        <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
          <Text style={styles.message}>Cadastre-se</Text>
        </Animatable.View>

        <ScrollView style={{flex:1}}
                    contentContainerStyle={{ paddingBottom: 50 }}>
        <Animatable.View animation="fadeInUp" style={styles.containerForm}>
          <Text style={styles.title}>Nome/Razão Social</Text>
          <TextInput 
            placeholder="Digite seu nome ou Razão Social"
            style={styles.input}
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.title}>Telefone</Text>
          <TextInput 
            placeholder="Digite seu telefone"
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
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
            value={cpfCnpj}
            onChangeText={setCpfCnpj}
          />

          <Text style={styles.title}>Endereço</Text>
          <TextInput 
            placeholder="Digite seu endereço - nº"
            style={styles.input}
            value={endereco}
            onChangeText={setEndereco}
          />

          <Text style={styles.title}>CEP</Text>
          <TextInput 
            placeholder="Digite seu CEP"
            style={styles.input}
            value={cep}
            onChangeText={setCep}
            keyboardType="numeric"
          />

        <Text style={styles.title}>Cidade</Text>
          <TextInput 
            placeholder="Digite sua cidade"
            style={styles.input}
            value={cidade}
            onChangeText={setCidade}
          />

        <Text style={styles.title}>Estado</Text>
          <TextInput 
            placeholder="Digite seu estado"
            style={styles.input}
            value={estado}
            onChangeText={setEstado}
          />

          <Text style={styles.title}>E-mail</Text>
          <TextInput 
            placeholder="Digite seu E-mail"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.title}>Senha</Text>
          <TextInput 
            placeholder="Digite uma senha"
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
          <Text style={styles.title}>Confirme sua senha</Text>
          <TextInput 
              placeholder="Confirme sua senha"
              style={styles.input}
              value={confirmSenha}
              onChangeText={setConfirmSenha}
              secureTextEntry
          />

          <TouchableOpacity 
            onPress={handleCadastro}
            style={[styles.button, loading && styles.buttonDisabled]}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>
        </Animatable.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});