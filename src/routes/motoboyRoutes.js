const express = require('express');
const router = express.Router();
const motoboyController = require('../controllers/motoboyController');

router.post('/register', motoboyController.register);
router.post('/login', motoboyController.login);
router.get('/profile', motoboyController.getProfile);
router.put('/profile', motoboyController.updateProfile);
router.get('/available', motoboyController.getAvailable);

module.exports = router; 