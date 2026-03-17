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
            proveedor,
            unidad_medida // 👇 NUEVO: Recibimos la medida (kg, litro, unidad)
        } = req.body;
        
        // 1. Validación de campos críticos
        if (!empresa_id || !nombre || !precio_compra || !precio_venta) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios (Empresa, Nombre o Precios)' });
        }

        // 2. Limpieza de datos (Evitamos enviar strings vacíos o nulls que MySQL rechace)
        const catId = categoria_id || null; 
        const codBarras = codigo_barras || '';
        const prov = proveedor || '';
        // 👇 CLAVE: parseFloat para que acepte decimales como 10.5
        const sActual = parseFloat(stock_actual) || 0;
        const sMin = parseFloat(stock_minimo) || 0;
        // 👇 CLAVE: Si viene vacío, por defecto le ponemos 'unidad'
        const uMedida = unidad_medida || 'unidad'; 

        // 3. Ejecución del INSERT
        const [resultado] = await db.query(
            `INSERT INTO productos 
            (empresa_id, categoria_id, codigo_barras, nombre, precio_compra, precio_venta, stock_actual, stock_minimo, proveedor, unidad_medida) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, // <-- Agregamos un ? más
            [empresa_id, catId, codBarras, nombre, precio_compra, precio_venta, sActual, sMin, prov, uMedida]
        );

        res.status(201).json({
            mensaje: 'Producto registrado con éxito',
            productoId: resultado.insertId
        });

    } catch (error) {
        // 👇 ESTO ES CLAVE: Ahora el error se verá clarito en los Logs de Render
        console.error('--- ERROR EN BASE DE DATOS ---');
        console.error('Mensaje:', error.sqlMessage); 
        console.error('Código:', error.code);
        
        res.status(500).json({ 
            mensaje: 'Error en el servidor al guardar producto',
            detalle: error.sqlMessage // Solo para debugear, luego puedes quitarlo
        });
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
        
        // 👇 NUEVO: Atrapamos unidad_medida y stock_minimo
        const { codigo_barras, nombre, precio_compra, precio_venta, stock_actual, stock_minimo, categoria_id, proveedor, unidad_medida } = req.body;
        const empresa_id = req.usuario.empresa_id; // Del token de seguridad

        // 👇 CLAVE: Limpiamos los datos y permitimos decimales
        const sActual = parseFloat(stock_actual) || 0;
        const sMin = parseFloat(stock_minimo) || 0;
        const uMedida = unidad_medida || 'unidad';

        // 👇 NUEVO: Agregamos unidad_medida y stock_minimo al UPDATE
        const [resultado] = await db.query(
            `UPDATE productos 
             SET codigo_barras = ?, nombre = ?, precio_compra = ?, precio_venta = ?, stock_actual = ?, stock_minimo = ?, categoria_id = ?, proveedor = ?, unidad_medida = ? 
             WHERE id = ? AND empresa_id = ?`,
            [codigo_barras, nombre, precio_compra, precio_venta, sActual, sMin, categoria_id, proveedor, uMedida, id, empresa_id]
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