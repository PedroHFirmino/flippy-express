const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'flippy',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timeout: 60000,
    reconnect: true
};

let pool;

const createPool = () => {
    if (!pool) {
        pool = mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return pool;
};

const testConnection = async () => {
    try {
        const connection = await createPool().getConnection();
        console.log(' Conexão com o banco de dados estabelecida com sucesso!');
        console.log(` Banco: ${dbConfig.database}`);
        connection.release();
    } catch (error) {
        console.error(' Erro ao conectar com o banco de dados:', error.message);
    }
};

const getConnection = () => {
    return createPool();
};

// Executar query
const executeQuery = async (query, params = []) => {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Erro na execução da query:', error);
        throw error;
    }
};


const executeTransaction = async (queries) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const query of queries) {
            const [rows] = await connection.execute(query.sql, query.params || []);
            results.push(rows);
        }
        
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    testConnection,
    getConnection,
    dbConfig,
    executeQuery,
    executeTransaction
}; 