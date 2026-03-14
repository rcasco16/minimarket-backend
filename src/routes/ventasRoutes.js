const express = require('express');
const router = express.Router();

const { registrarVenta, obtenerResumenDiario, cerrarCaja } = require('../controllers/ventasController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, registrarVenta);
router.get('/resumen-diario/:empresa_id', verificarToken, obtenerResumenDiario);
router.post('/cerrar-turno', verificarToken, cerrarCaja);

module.exports = router;