const express = require('express');
const router = express.Router();
const motoboyController = require('../controllers/motoboyController');
const { verifyToken, verifyMotoboy } = require('../middleware/auth');


router.post('/register', motoboyController.register);
router.post('/login', motoboyController.login);


router.get('/profile', verifyToken, verifyMotoboy, motoboyController.getProfile);
router.put('/profile', verifyToken, verifyMotoboy, motoboyController.updateProfile);
router.get('/available', motoboyController.getAvailable);

module.exports = router; 