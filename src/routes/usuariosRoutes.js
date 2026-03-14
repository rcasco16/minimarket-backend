const express = require('express');
const router = express.Router();
const { obtenerUsuarios, crearUsuario } = require('../controllers/usuariosController');
const { verificarToken, verificarRolAdmin } = require('../middlewares/authMiddleware');

// Solo los administradores pueden ver y crear personal
router.get('/empresa/:empresa_id', verificarToken, verificarRolAdmin, obtenerUsuarios);
router.post('/', verificarToken, verificarRolAdmin, crearUsuario);

module.exports = router;