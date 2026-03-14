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
    try {
        const { nombre, empresa_id } = req.body;
        
        if (!nombre || !empresa_id) {
            return res.status(400).json({ mensaje: 'Faltan datos para la categoría' });
        }

        const [resultado] = await db.query(
            'INSERT INTO categorias (nombre, empresa_id) VALUES (?, ?)',
            [nombre, empresa_id]
        );

        res.status(201).json({ 
            mensaje: 'Categoría creada',
            id: resultado.insertId, // Devolvemos el número de ID recién creado
            nombre: nombre 
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ mensaje: 'Error al crear la categoría' });
    }
};

module.exports = { obtenerCategorias, crearCategoria };