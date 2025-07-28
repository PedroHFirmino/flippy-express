const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');


router.post('/create', pedidoController.create);
router.post('/calcular-preco', pedidoController.calcularPreco);
router.get('/user/:userId', pedidoController.getUserOrders);
router.get('/motoboy/:motoboyId', pedidoController.getMotoboyOrders);
router.patch('/:id/status', pedidoController.updateStatus);
router.get('/pendentes', pedidoController.getPedidosPendentes);
router.get('/user/:userId/em-andamento', pedidoController.getPedidoEmAndamentoUser);
router.get('/user/:userId/ultimo', pedidoController.getUltimoPedidoUser);
router.get('/user/:userId/hoje', pedidoController.getEntregasHojeUser);
router.get('/:id', pedidoController.getOrderById);
router.post('/:pedidoId/aceitar', pedidoController.aceitarPedido);

module.exports = router; 