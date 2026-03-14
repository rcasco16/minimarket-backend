const db = require('../config/db');

const obtenerCategorias = async (req, res) => {
    try {
        const { empresa_id } = req.params;
        const [categorias] = await db.query('SELECT * FROM categorias WHERE empresa_id = ?', [empresa_id]);
        res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ mensaje: 'Error al obtener categorías' });
    }
};

const crearCategoria = async (req, res) => {
    console.log("--- INTENTO DE CREAR CATEGORÍA ---");
    console.log("Datos recibidos:", req.body); // Esto saldrá en los Logs de Render

    try {
        const { nombre, empresa_id } = req.body;
        
        if (!nombre || !empresa_id) {
            console.log("Faltan datos:", { nombre, empresa_id });
            return res.status(400).json({ mensaje: 'Faltan datos: nombre o empresa_id' });
        }

        const [resultado] = await db.query(
            'INSERT INTO categorias (nombre, empresa_id) VALUES (?, ?)',
            [nombre.trim(), Number(empresa_id)]
        );

        res.status(201).json({ id: resultado.insertId, nombre: nombre });
    } catch (error) {
        console.error('ERROR SQL DETALLADO:', error.sqlMessage);
        res.status(500).json({ mensaje: 'Error SQL', detalle: error.sqlMessage });
    }
};

module.exports = { obtenerCategorias, crearCategoria };