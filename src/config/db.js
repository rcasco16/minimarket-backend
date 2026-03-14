const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // 👇 ESTO ES LO QUE LE PERMITE CONECTARSE A LA NUBE 👇
    ssl: {
        rejectUnauthorized: false
    }
});

const promisePool = pool.promise();

promisePool.getConnection()
    .then(connection => {
        console.log('✅ Conectado exitosamente a la base de datos en AIVEN CLOUD');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a la base de datos:', err);
    });

module.exports = promisePool;