const nodemailer = require('nodemailer');
const emailConfig = require('../config/email.config');




const emailService = {
    async enviarSolicitacaoSaque(dados) {
        try {

                       
            const emailContent = `
========================================
SOLICITAÇÃO DE SAQUE - FLIPPY EXPRESS
========================================

DADOS DO MOTOBOY:
Nome: ${dados.nomeMotoboy}
Email: ${dados.emailMotoboy}

DADOS PARA SAQUE:
Nome para Saque: ${dados.nomeSolicitante}
Chave PIX: ${dados.chavePix}
Banco: ${dados.banco}
Valor Disponível: R$ ${Number(dados.valorDisponivel).toFixed(2)}

INFORMAÇÕES ADICIONAIS:
Data da Solicitação: ${dados.dataSolicitacao}
ID da Solicitação: #${dados.idSolicitacao}

========================================
Este e-mail seria enviado para: ${emailConfig.email.to}
========================================
            `;

            console.log(' E-MAIL DE SOLICITAÇÃO DE SAQUE:');
            console.log(emailContent);
            console.log(' FIM DO E-MAIL');
            
            return { success: true, messageId: 'simulated-email-' + Date.now() };
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            return { success: false, error: error.message };
        }
    }
};

module.exports = emailService; 