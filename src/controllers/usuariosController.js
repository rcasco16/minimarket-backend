const db = require('../config/db');

// Obtener todos los empleados de la empresa
const obtenerUsuarios = async (req, res) => {
    try {
        const { empresa_id } = req.params;
        const [usuarios] = await db.query(
            'SELECT id, nombre, email, rol FROM usuarios WHERE empresa_id = ?',
            [empresa_id]
        );
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener el personal' });
    }
};

// Crear un nuevo empleado
const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol, empresa_id } = req.body;

        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
        }

        // Verificamos si el correo ya existe
        const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(400).json({ mensaje: 'Este correo ya está registrado' });
        }

        // Insertamos el usuario (Nota: guardamos texto plano por ahora para mantenerlo simple)
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre, email, password_hash, rol, empresa_id) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, password, rol, empresa_id]
        );

        res.status(201).json({ mensaje: 'Empleado registrado con éxito' });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ mensaje: 'Error al registrar empleado' });
    }
};

module.exports = { obtenerUsuarios, crearUsuario };