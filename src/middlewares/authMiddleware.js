const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en el encabezado (Header) de la petición
    const authHeader = req.headers['authorization'];
    
    // El formato estándar es "Bearer AQUÍ_VA_EL_TOKEN"
    const token = authHeader && authHeader.split(' ')[1]; 

    // 2. Si no trae credencial, le bloqueamos el paso
    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Se requiere iniciar sesión.' });
    }

    try {
        // 3. Verificamos que el token sea auténtico usando nuestra firma secreta
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Guardamos los datos de Doña Rosa (como su empresa_id) dentro de "req" 
        // para que los controladores puedan usarlos más adelante
        req.usuario = decodificado; 
        
        // 5. ¡Todo en orden! Le decimos a Node que continúe con lo que el usuario quería hacer
        next();
    } catch (error) {
        return res.status(403).json({ mensaje: 'El token es inválido o ya expiró.' });
    }
};

const verificarRolAdmin = (req, res, next) => {
    // Como verificarToken se ejecuta primero, ya tenemos los datos en req.usuario
    if (!req.usuario || req.usuario.rol !== 'Administrador') {
        return res.status(403).json({ 
            mensaje: 'Acceso denegado. Solo los administradores pueden realizar esta acción.' 
        });
    }
    
    // Si es Administrador, lo dejamos pasar
    next();
};

module.exports = { verificarToken, verificarRolAdmin };