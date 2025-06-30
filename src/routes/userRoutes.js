const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyUser } = require('../middleware/auth');


router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', verifyToken, verifyUser, userController.getProfile);
router.put('/profile', verifyToken, verifyUser, userController.updateProfile);

module.exports = router; 