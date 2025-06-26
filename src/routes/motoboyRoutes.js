const express = require('express');
const router = express.Router();
const motoboyController = require('../controllers/motoboyController');
const { verifyToken, verifyMotoboy } = require('../middleware/auth');


router.post('/register', motoboyController.register);
router.post('/login', motoboyController.login);
router.get('/available', motoboyController.getAvailable);
router.get('/all', motoboyController.getAllMotoboys);
router.get('/ranking', motoboyController.getRanking);
router.get('/testar-calculo-precos', motoboyController.testarCalculoPrecos);


router.get('/profile', verifyToken, verifyMotoboy, motoboyController.getProfile);
router.put('/profile', verifyToken, verifyMotoboy, motoboyController.updateProfile);


router.put('/stats', motoboyController.updateStats);
router.post('/delivery-history', motoboyController.insertDeliveryHistory);
router.put('/update-all-stats', motoboyController.updateAllStats);

module.exports = router;