const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./database/connection');


const userRoutes = require('./routes/userRoutes');
const motoboyRoutes = require('./routes/motoboyRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:8081', 'exp://localhost:19000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


testConnection();


app.use('/api/users', userRoutes);
app.use('/api/motoboys', motoboyRoutes);
app.use('/api/pedidos', pedidoRoutes);


app.get('/ping', (req, res) => {
    res.json({
        success: true,
        message: 'Flippy Express API está funcionando!',
        timestamp: new Date().toISOString()
    });
});


app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});


app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor Flippy Express rodando na porta ${PORT}`);
    console.log(`API disponível em: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/ping`);
}); 