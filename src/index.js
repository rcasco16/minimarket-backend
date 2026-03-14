const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db'); 

// 1. Importamos la ruta de planes (NUEVO)
const planesRoutes = require('./routes/planesRoutes');
const empresasRoutes = require('./routes/empresasRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const productosRoutes = require('./routes/productosRoutes');
const ventasRoutes = require('./routes/ventasRoutes');
const authRoutes = require('./routes/authRoutes');
const reportesRoutes = require('./routes/reportesRoutes');

const app = express();

app.use(cors()); 
app.use(express.json()); 

// 2. Le decimos al servidor que use esa ruta (NUEVO)
// Así la URL completa será: http://localhost:3000/api/planes
app.use('/api/planes', planesRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reportes', reportesRoutes);

app.get('/', (req, res) => {
    res.json({ estado: 'Éxito', mensaje: '¡Servidor del SaaS funcionando al 100%!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo sin problemas en http://localhost:${PORT}`);
});