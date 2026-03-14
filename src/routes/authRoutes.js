const express = require('express');
const router = express.Router();
// 👇 IMPORTAMOS LAS DOS FUNCIONES AQUÍ 👇
const { login, registrarEmpresa } = require('../controllers/authController');

// Ruta para iniciar sesión
router.post('/login', login);

// Ruta para registrar nuevos clientes (empresas)
router.post('/registrar-cliente', registrarEmpresa);

module.exports = router;