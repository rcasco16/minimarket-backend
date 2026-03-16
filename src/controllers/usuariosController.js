const db = require('../config/db');
const bcrypt = require('bcrypt'); // 👇 Necesario para la seguridad

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

// Crear un nuevo empleado (CON ENCRIPTACIÓN)
const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol, empresa_id } = req.body;

        if (!nombre || !email || !password || !rol || !empresa_id) {
            return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
        }

        // 1. Verificamos si el correo ya existe
        const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(400).json({ mensaje: 'Este correo ya está registrado' });
        }

        // 2. 👇 NUEVO: Encriptamos la contraseña antes de guardar
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        // 3. Insertamos el usuario con la contraseña segura
        await db.query(
            'INSERT INTO usuarios (nombre, email, password_hash, rol, empresa_id) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, passwordEncriptada, rol, empresa_id]
        );

        res.status(201).json({ mensaje: 'Empleado registrado con éxito' });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ mensaje: 'Error al registrar empleado' });
    }
};

// 👇 NUEVO: Borrar un empleado
const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        // Obtenemos empresa_id del token (req.usuario) para asegurar que un admin 
        // no borre usuarios de otra empresa por error en la URL
        const empresa_id = req.usuario.empresa_id; 

        // Borramos el usuario siempre que pertenezca a la empresa y NO sea el admin principal (opcional)
        const [resultado] = await db.query(
            'DELETE FROM usuarios WHERE id = ? AND empresa_id = ? AND rol != "admin"',
            [id, empresa_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado o no tienes permiso para borrarlo' });
        }

        res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ mensaje: 'Error al intentar eliminar el usuario' });
    }
};

module.exports = { obtenerUsuarios, crearUsuario, eliminarUsuario };