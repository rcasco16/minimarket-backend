const db = require('../config/db');

const obtenerReportes = async (req, res) => {
    try {
        const { empresa_id } = req.params;
        const { fechaInicio, fechaFin } = req.query; // Atrapamos los filtros de fecha si existen

        // Preparamos el filtro de fechas (por defecto busca todo, pero si envían fechas, filtra)
        let filtroFechas = '';
        let params = [empresa_id];

        if (fechaInicio && fechaFin) {
            filtroFechas = ' AND DATE(v.fecha_hora) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }

        // 1. KPIs Generales (Ventas, Costos, Ganancia Neta, Cantidad de Tickets)
        const [kpis] = await db.query(
            `SELECT 
                COUNT(DISTINCT v.id) as cantidad_tickets,
                SUM(v.total) as total_vendido,
                SUM(vd.cantidad * p.precio_compra) as costo_total
             FROM ventas v
             LEFT JOIN ventas_detalles vd ON v.id = vd.venta_id
             LEFT JOIN productos p ON vd.producto_id = p.id
             WHERE v.empresa_id = ? ${filtroFechas}`,
            params
        );

        const totalVendido = kpis[0].total_vendido || 0;
        const costoTotal = kpis[0].costo_total || 0;
        const gananciaNeta = totalVendido - costoTotal;
        const cantidadTickets = kpis[0].cantidad_tickets || 0;

        // 2. Historial de Tickets (Últimas 50 ventas del periodo seleccionado)
        const [tickets] = await db.query(
            `SELECT id, fecha_hora, metodo_pago, total, estado_caja 
             FROM ventas v
             WHERE empresa_id = ? ${filtroFechas}
             ORDER BY fecha_hora DESC
             LIMIT 50`,
            params
        );

        // 3. Productos Estrella (Top 5 más vendidos en ese periodo)
        // Volvemos a pasar los parámetros porque es una consulta nueva
        let paramsEstrella = [empresa_id];
        if (fechaInicio && fechaFin) {
            paramsEstrella.push(fechaInicio, fechaFin);
        }

        const [productosEstrella] = await db.query(
            `SELECT 
                p.nombre, 
                SUM(vd.cantidad) as cantidad_vendida,
                SUM(vd.subtotal) as total_generado
             FROM ventas_detalles vd
             JOIN ventas v ON vd.venta_id = v.id
             JOIN productos p ON vd.producto_id = p.id
             WHERE v.empresa_id = ? ${filtroFechas}
             GROUP BY p.id
             ORDER BY cantidad_vendida DESC
             LIMIT 5`,
            paramsEstrella
        );

        // 4. Enviamos todo el paquete empaquetado a React
        res.status(200).json({
            kpis: {
                totalVendido,
                costoTotal,
                gananciaNeta,
                cantidadTickets
            },
            tickets,
            productosEstrella
        });

    } catch (error) {
        console.error('Error al obtener reportes:', error);
        res.status(500).json({ mensaje: 'Error al generar los reportes' });
    }
};

module.exports = { obtenerReportes };