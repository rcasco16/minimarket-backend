const db = require('../config/db');

const crearEmpresa = async (req, res) => {
    try {
        const { nombre_comercial, ruc, plan_id } = req.body;
        
        // Validamos que al menos tenga un nombre
        if (!nombre_comercial) {
            return res.status(400).json({ mensaje: 'El nombre comercial es obligatorio' });
        }

        // Insertamos el minimarket en la base de datos
        const [resultado] = await db.query(
            'INSERT INTO empresas (nombre_comercial, ruc, plan_id) VALUES (?, ?, ?)',
            [nombre_comercial, ruc, plan_id]
        );

        res.status(201).json({
            mensaje: 'Minimarket registrado con éxito',
            empresaId: resultado.insertId
        });
    } catch (error) {
        console.error('Error al registrar empresa:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

module.exports = { crearEmpresa };