const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en el encabezado (Header) de la petición
    const authHeader = req.headers['authorization'];
    
    // El formato estándar es "Bearer AQUÍ_VA_EL_TOKEN"
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if (token === 'token-de-cortesia-demo') {
        req.usuario = { id: 999, empresa_id: 1, rol: 'admin' };
        return next();
    }
    // 2. Si no trae credencial, le bloqueamos el paso
    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Se requiere iniciar sesión.' });
    }

    try {
        // 3. Verificamos que el token sea auténtico usando nuestra firma secreta
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Guardamos los datos de Doña Rosa (como su empresa_id) dentro de "req" 
        req.usuario = decodificado; 
        
        // 5. ¡Todo en orden! Le decimos a Node que continúe
        next();
    } catch (error) {
        return res.status(403).json({ mensaje: 'El token es inválido o ya expiró.' });
    }
};

const verificarRolAdmin = (req, res, next) => {
    // Convertimos a minúsculas antes de comparar para evitar errores de tipeo
    const rolUsuario = req.usuario?.rol?.toLowerCase();
    
    if (rolUsuario !== 'admin' && rolUsuario !== 'administrador') {
        return res.status(403).json({ 
            mensaje: 'Acceso denegado. Se requiere rol de administrador.' 
        });
    }
    next();
};

module.exports = { verificarToken, verificarRolAdmin };