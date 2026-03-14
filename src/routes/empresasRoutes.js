const express = require('express');
const router = express.Router();
const { crearEmpresa } = require('../controllers/empresasController');

// Cuando alguien haga POST a esta ruta, creará una empresa
router.post('/', crearEmpresa);

module.exports = router;