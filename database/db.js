const mysql = require('mysql2/promise')

const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost'
const user = process.env.MYSQLUSER || process.env.DB_USER || 'root'
const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || ''
const database = process.env.MYSQLDATABASE || process.env.DB_NAME || 'classhub_db'
const port = Number(process.env.MYSQLPORT) || Number(process.env.DB_PORT) || 3306

const db = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000
})

module.exports = db