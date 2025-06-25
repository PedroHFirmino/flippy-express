const { testConnection, executeQuery } = require('./database/connection');

async function testDB() {
    console.log(' Testando conexão com o banco de dados...\n');
    
    try {
        
        await testConnection();
        
        
        console.log('Testando query simples...');
        const result = await executeQuery('SELECT 1 as test');
        console.log('Query executada:', result);
        
        
        console.log('\n Verificando banco de dados...');
        const databases = await executeQuery('SHOW DATABASES');
        const flippyExists = databases.some(db => db.Database === 'flippy');
        
        if (flippyExists) {
            console.log('Banco "flippy" encontrado!');
            
            // Verificar tabelas
            const tables = await executeQuery('SHOW TABLES');
            console.log(`Tabelas encontradas: ${tables.length}`);
            
            if (tables.length > 0) {
                console.log('Tabelas criadas com sucesso!');
            } else {
                console.log('Nenhuma tabela encontrada.');
            }
        } else {
            console.log('Banco "flippy" não encontrado!');
            console.log('Execute: mysql -u root -p < database/schema.sql');
        }
        
    } catch (error) {
        console.error('Erro:', error.message);
    }
    
    console.log('\n Teste concluído!');
    process.exit(0);
}

testDB(); 