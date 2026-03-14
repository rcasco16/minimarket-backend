const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Ruta para iniciar sesión
router.post('/login', login);

router.post('/registrar-cliente', registrarEmpresa);

module.exports = router;