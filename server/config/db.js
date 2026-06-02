const mysql = require('mysql2');

// 创建数据库连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',  // 改成你的 MySQL 密码
    database: 'schedule',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 使用 Promise 版本
const db = pool.promise();

module.exports = db;