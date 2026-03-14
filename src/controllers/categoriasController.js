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
        
        // 1. Validación de seguridad básica
        if (!nombre || !empresa_id) {
            return res.status(400).json({ mensaje: 'Faltan datos (nombre o empresa_id) para la categoría' });
        }

        // 2. Insertar con el ID de empresa asegurado
        const [resultado] = await db.query(
            'INSERT INTO categorias (nombre, empresa_id) VALUES (?, ?)',
            [nombre.trim(), Number(empresa_id)]
        );

        res.status(201).json({ 
            mensaje: 'Categoría creada con éxito',
            id: resultado.insertId, 
            nombre: nombre 
        });
    } catch (error) {
        console.error('Error detallado en categorías:', error);
        res.status(500).json({ 
            mensaje: 'Error al crear la categoría', 
            detalle: error.sqlMessage 
        });
    }
};

module.exports = { obtenerCategorias, crearCategoria };