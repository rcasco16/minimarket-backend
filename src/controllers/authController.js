const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // 👈 AÑADIMOS LA LIBRERÍA DE SEGURIDAD

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscamos si el correo existe
        const [usuarios] = await db.query(
            `SELECT u.*, e.nombre_comercial 
             FROM usuarios u 
             INNER JOIN empresas e ON u.empresa_id = e.id 
             WHERE u.email = ?`, 
            [email]
        );
        
        if (usuarios.length === 0) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        const usuario = usuarios[0];

        // 2. Comparamos la contraseña desencriptando con bcrypt 👈 (EL CAMBIO MÁGICO)
        const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
        
        if (!passwordCorrecta) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        // 3. ¡Todo correcto! Creamos el Token JWT
        const token = jwt.sign(
            { 
                id: usuario.id, 
                empresa_id: usuario.empresa_id, 
                rol: usuario.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } 
        );

        // 4. Se lo enviamos al cliente
        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol,
                empresa_id: usuario.empresa_id,
                nombre_comercial: usuario.nombre_comercial 
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

module.exports = { login };