require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

// Função para iniciar o servidor
async function startServer() {
  try {
    // Testar conexão com banco de dados
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');

    // Sincronizar modelos (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      // await sequelize.sync({ alter: true });
      // console.log('✅ Modelos sincronizados com banco de dados');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🕐  Sistema de Ponto Eletrônico - API              ║
║                                                       ║
║   📡  Servidor rodando na porta: ${PORT}                ║
║   🌍  Ambiente: ${process.env.NODE_ENV || 'development'}                    ║
║   📚  Documentação: http://localhost:${PORT}/api-docs     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de sinais de encerramento
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM recebido. Encerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT recebido. Encerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

// Iniciar servidor
startServer();
