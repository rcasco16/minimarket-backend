const db = require('../config/db');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscamos si el correo existe, y hacemos JOIN para traer el nombre de su empresa
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

        // 2. Comparamos la contraseña 
        // (Nota: Como guardamos la de Doña Rosa en texto plano en el paso anterior, comparamos directo. 
        // Más adelante implementaremos bcrypt para encriptarlas).
        if (password !== usuario.password_hash) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        // 3. ¡Todo correcto! Creamos el Token JWT
        // Guardamos dentro del token los datos clave: quién es y a qué empresa pertenece
        const token = jwt.sign(
            { 
                id: usuario.id, 
                empresa_id: usuario.empresa_id, 
                rol: usuario.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // El token caduca en 8 horas (un turno de trabajo normal)
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
                nombre_comercial: usuario.nombre_comercial // 👈 AQUÍ ENVIAMOS EL NOMBRE DEL LOCAL
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

module.exports = { login };