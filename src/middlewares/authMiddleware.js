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
        req.usuario = decodificado; 
        
        // 5. ¡Todo en orden! Le decimos a Node que continúe
        next();
    } catch (error) {
        return res.status(403).json({ mensaje: 'El token es inválido o ya expiró.' });
    }
};

const verificarRolAdmin = (req, res, next) => {
    // 👇 AQUÍ ESTÁ EL CAMBIO: Ahora buscamos 'admin' (como está en la base de datos)
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({ 
            mensaje: 'Acceso denegado. Solo los administradores pueden realizar esta acción.' 
        });
    }
    
    // Si es admin, lo dejamos pasar
    next();
};

module.exports = { verificarToken, verificarRolAdmin };