const express = require('express');
const router = express.Router();
const { obtenerCategorias, crearCategoria } = require('../controllers/categoriasController');
const { verificarToken, verificarRolAdmin } = require('../middlewares/authMiddleware');

router.get('/empresa/:empresa_id', verificarToken, obtenerCategorias);
router.post('/', verificarToken, verificarRolAdmin, crearCategoria);

module.exports = router;