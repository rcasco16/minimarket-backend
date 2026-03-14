const db = require('../config/db');

const registrarVenta = async (req, res) => {
    // Pedimos una conexión exclusiva para hacer la Transacción
    const conexion = await db.getConnection();
    
    try {
        // 🚦 INICIAMOS LA TRANSACCIÓN
        await conexion.beginTransaction();

        // Recibimos los datos de la venta y la lista de productos (detalles)
        const { empresa_id, usuario_id, metodo_pago, total, detalles } = req.body;

        // PASO 1: Crear la cabecera de la venta (El Ticket)
        const [resultVenta] = await conexion.query(
            'INSERT INTO ventas (empresa_id, usuario_id, metodo_pago, total) VALUES (?, ?, ?, ?)',
            [empresa_id, usuario_id, metodo_pago, total]
        );
        const venta_id = resultVenta.insertId;

        // PASO 2: Recorrer la lista de productos que el cliente compró
        for (let item of detalles) {
            // A) Guardar cada producto en el ticket (ventas_detalles)
            await conexion.query(
                'INSERT INTO ventas_detalles (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [venta_id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
            );

            // B) Descontar la cantidad vendida del stock actual del producto
            await conexion.query(
                'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ? AND empresa_id = ?',
                [item.cantidad, item.producto_id, empresa_id]
            );
        }

        // 🏁 CONFIRMAMOS LA TRANSACCIÓN (Guardamos todo de forma permanente)
        await conexion.commit();

        res.status(201).json({
            mensaje: 'Venta registrada y stock descontado con éxito',
            ventaId: venta_id
        });

    } catch (error) {
        // 🛑 SI ALGO FALLA, DESHACEMOS TODO PARA NO DEJAR DATOS ROTOS
        await conexion.rollback();
        console.error('Error en la venta:', error);
        res.status(500).json({ mensaje: 'Hubo un error al procesar la venta' });
    } finally {
        // Soltamos la conexión para que otro cliente pueda usarla
        conexion.release();
    }
};

    const obtenerResumenDiario = async (req, res) => {
    try {
        const { empresa_id } = req.params;

        // Sumamos solo las ventas que tienen estado_caja = 'Abierta'
        const [ventasHoy] = await db.query(
            `SELECT metodo_pago, SUM(total) as total 
             FROM ventas 
             WHERE empresa_id = ? AND estado_caja = 'Abierta'
             GROUP BY metodo_pago`,
            [empresa_id]
        );

        const [costosHoy] = await db.query(
            `SELECT 
                SUM(vd.subtotal) as ingresos_totales, 
                SUM(vd.cantidad * p.precio_compra) as costo_total
             FROM ventas_detalles vd
             JOIN ventas v ON vd.venta_id = v.id
             JOIN productos p ON vd.producto_id = p.id
             WHERE v.empresa_id = ? AND v.estado_caja = 'Abierta'`,
            [empresa_id]
        );

        const resumen = {
            efectivo: ventasHoy.find(v => v.metodo_pago === 'Efectivo')?.total || 0,
            tarjeta: ventasHoy.find(v => v.metodo_pago === 'Tarjeta')?.total || 0,
            transferencia: ventasHoy.find(v => v.metodo_pago === 'Transferencia')?.total || 0,
            ingresos_totales: costosHoy[0].ingresos_totales || 0,
            costo_total: costosHoy[0].costo_total || 0,
            ganancia_neta: (costosHoy[0].ingresos_totales || 0) - (costosHoy[0].costo_total || 0)
        };

        res.status(200).json(resumen);
    } catch (error) {
        console.error('Error al obtener el resumen diario:', error);
        res.status(500).json({ mensaje: 'Error al calcular el cierre de caja' });
    }
};
const cerrarCaja = async (req, res) => {
    try {
        // Obtenemos el ID de la empresa directamente del token del usuario activo
        const empresa_id = req.usuario.empresa_id; 

        const [resultado] = await db.query(
            `UPDATE ventas SET estado_caja = 'Cerrada' WHERE empresa_id = ? AND estado_caja = 'Abierta'`,
            [empresa_id]
        );

        res.status(200).json({ 
            mensaje: 'Caja cerrada correctamente. Turno finalizado.', 
            ventasCerradas: resultado.affectedRows 
        });
    } catch (error) {
        console.error('Error al cerrar caja:', error);
        res.status(500).json({ mensaje: 'Error al cerrar caja' });
    }
};

module.exports = { registrarVenta, obtenerResumenDiario, cerrarCaja };