import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, Alert } from 'react-native';

const CHAVE_PIX = 'flippy-pagamentos@banco.com'; 
const TEMPO_TOTAL = 5 * 60; 

const PagamentoPixScreen = ({ navigation }) => {
  const [tempoRestante, setTempoRestante] = useState(TEMPO_TOTAL);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [expirado, setExpirado] = useState(false);

  useEffect(() => {
    if (tempoRestante <= 0) {
      setExpirado(true);
      return;
    }
    if (pagamentoConfirmado) return;
    const timer = setInterval(() => {
      setTempoRestante((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [tempoRestante, pagamentoConfirmado]);

  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const copiarChave = () => {
    Clipboard.setString(CHAVE_PIX);
    Alert.alert('Chave Pix copiada!');
  };

  const confirmarPagamento = () => {
    setPagamentoConfirmado(true);
    setTimeout(() => {
      navigation.goBack(); 
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Pagamento via Pix</Text>
      <Text style={styles.timer}>Tempo restante: {formatarTempo(tempoRestante)}</Text>
      <View style={styles.pixBox}>
        <Text style={styles.label}>Chave Pix:</Text>
        <TouchableOpacity onPress={copiarChave} style={styles.chaveBox}>
          <Text selectable style={styles.chave}>{CHAVE_PIX}</Text>
          <Text style={styles.copiar}>Toque para copiar</Text>
        </TouchableOpacity>
      </View>
      {expirado && !pagamentoConfirmado ? (
        <Text style={styles.expirado}>Tempo expirado! Refaça o pedido.</Text>
      ) : pagamentoConfirmado ? (
        <Text style={styles.sucesso}>Pedido enviado! Obrigado pelo pagamento.</Text>
      ) : (
        <TouchableOpacity style={styles.botao} onPress={confirmarPagamento}>
          <Text style={styles.textoBotao}>Já fiz o Pix</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00b5f8',
    marginBottom: 24,
  },
  timer: {
    fontSize: 20,
    color: '#333',
    marginBottom: 24,
  },
  pixBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontSize: 18,
  },
  chaveBox: {
    alignItems: 'center',
  },
  chave: {
    color: '#00b5f8',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  copiar: {
    color: '#0077b6',
    fontSize: 14,
  },
  botao: {
    backgroundColor: '#00b5f8',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  sucesso: {
    color: 'green',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
  },
  expirado: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
  },
});

export default PagamentoPixScreen; 