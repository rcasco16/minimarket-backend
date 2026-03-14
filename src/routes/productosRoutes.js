const express = require('express');
const router = express.Router();
const { crearProducto, obtenerProductos, actualizarProducto } = require('../controllers/productosController');
const { verificarToken, verificarRolAdmin } = require('../middlewares/authMiddleware'); 
router.post('/', verificarToken, verificarRolAdmin, crearProducto);
router.get('/empresa/:empresa_id', verificarToken, obtenerProductos);
router.put('/:id', verificarToken, verificarRolAdmin, actualizarProducto);

module.exports = router;