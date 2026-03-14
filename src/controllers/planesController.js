const db = require('../config/db');

const crearPlan = async (req, res) => {
    try {
        // Obtenemos los datos que nos enviarán desde el cliente (Postman, Frontend, etc.)
        const { nombre, precio, limite_cajas } = req.body;
        
        // Validación básica
        if (!nombre || !precio) {
            return res.status(400).json({ mensaje: 'El nombre y el precio en Gs. son obligatorios' });
        }

        // Insertamos en la base de datos de forma segura (los signos de interrogación evitan hackeos)
        const [resultado] = await db.query(
            'INSERT INTO planes (nombre, precio, limite_cajas) VALUES (?, ?, ?)',
            [nombre, precio, limite_cajas || 1]
        );

        // Respondemos con éxito
        res.status(201).json({
            mensaje: 'Plan de suscripción creado con éxito',
            planId: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear plan:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

module.exports = { crearPlan };