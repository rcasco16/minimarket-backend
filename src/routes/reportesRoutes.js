const express = require('express');
const router = express.Router();
const { obtenerReportes } = require('../controllers/reportesController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Ruta principal para extraer la data de los reportes
router.get('/:empresa_id', verificarToken, obtenerReportes);

module.exports = router;