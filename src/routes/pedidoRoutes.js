const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');


router.post('/create', pedidoController.create);
router.post('/calcular-preco', pedidoController.calcularPreco);
router.get('/user/:userId', pedidoController.getUserOrders);
router.get('/motoboy/:motoboyId', pedidoController.getMotoboyOrders);
router.put('/:id/status', pedidoController.updateStatus);
router.get('/:id', pedidoController.getOrderById);

module.exports = router; 