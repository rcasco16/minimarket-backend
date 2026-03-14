const express = require('express');
const router = express.Router();
const { crearPlan } = require('../controllers/planesController');

// Cuando alguien haga una petición POST a esta ruta, se ejecutará el controlador
router.post('/', crearPlan);

module.exports = router;