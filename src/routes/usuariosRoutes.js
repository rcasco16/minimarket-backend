const express = require('express');
const router = express.Router();
// 👇 IMPORTACIÓN LIMPIA (Una sola vez y con todas las funciones)
const { obtenerUsuarios, crearUsuario, eliminarUsuario } = require('../controllers/usuariosController');
const { verificarToken, verificarRolAdmin } = require('../middlewares/authMiddleware');

// Solo los administradores pueden ver y crear personal
router.get('/empresa/:empresa_id', verificarToken, verificarRolAdmin, obtenerUsuarios);
router.post('/', verificarToken, verificarRolAdmin, crearUsuario);

// 👇 CORREGIDO: Usamos eliminarUsuario directamente, sin el prefijo "usuariosController"
router.delete('/:id', verificarToken, verificarRolAdmin, eliminarUsuario);

module.exports = router;