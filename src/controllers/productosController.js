const db = require('../config/db');

const crearProducto = async (req, res) => {
    try {
        const { 
            empresa_id, 
            categoria_id, 
            codigo_barras, 
            nombre, 
            precio_compra, 
            precio_venta, 
            stock_actual, 
            stock_minimo,
            proveedor // 👇 NUEVO: Atrapamos el proveedor que envía React
        } = req.body;
        
        // Validación de campos obligatorios
        if (!empresa_id || !nombre || !precio_compra || !precio_venta) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios para crear el producto' });
        }

        // 👇 NUEVO: Agregamos el campo proveedor y su signo de interrogación en el INSERT
        const [resultado] = await db.query(
            `INSERT INTO productos 
            (empresa_id, categoria_id, codigo_barras, nombre, precio_compra, precio_venta, stock_actual, stock_minimo, proveedor) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [empresa_id, categoria_id, codigo_barras, nombre, precio_compra, precio_venta, stock_actual || 0, stock_minimo || 5, proveedor]
        );

        res.status(201).json({
            mensaje: 'Producto registrado en el inventario con éxito',
            productoId: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

const obtenerProductos = async (req, res) => {
    try {
        // Sacamos el ID de la empresa directamente de la URL
        const { empresa_id } = req.params;

        // ¡Aquí está la magia del SaaS! 
        // Le pedimos a MySQL SOLO los productos que coincidan con esa empresa.
        // Al usar SELECT *, el proveedor ya viene incluido automáticamente.
        const [productos] = await db.query(
            'SELECT * FROM productos WHERE empresa_id = ?',
            [empresa_id]
        );

        // Devolvemos la lista de productos al cliente
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params; // Sacamos el ID de la URL
        
        // 👇 NUEVO: Atrapamos el proveedor del req.body
        const { codigo_barras, nombre, precio_compra, precio_venta, stock_actual, categoria_id, proveedor } = req.body;
        const empresa_id = req.usuario.empresa_id; // Del token de seguridad

        // 👇 NUEVO: Agregamos proveedor = ? en el UPDATE
        const [resultado] = await db.query(
            `UPDATE productos 
             SET codigo_barras = ?, nombre = ?, precio_compra = ?, precio_venta = ?, stock_actual = ?, categoria_id = ?, proveedor = ? 
             WHERE id = ? AND empresa_id = ?`,
            [codigo_barras, nombre, precio_compra, precio_venta, stock_actual, categoria_id, proveedor, id, empresa_id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado o no autorizado' });
        }

        res.status(200).json({ mensaje: 'Producto actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ mensaje: 'Error en el servidor al actualizar producto' });
    }
};

module.exports = { crearProducto, obtenerProductos, actualizarProducto };