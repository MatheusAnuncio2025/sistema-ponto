require('dotenv').config();
const fs = require('fs');
const http = require('http');
const https = require('https');
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;
const HTTPS_ENABLED = String(process.env.HTTPS).toLowerCase() === 'true';
const SSL_CRT_FILE = process.env.SSL_CRT_FILE;
const SSL_KEY_FILE = process.env.SSL_KEY_FILE;

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

    // Iniciar servidor (HTTP/HTTPS)
    const server = (() => {
      if (HTTPS_ENABLED && SSL_CRT_FILE && SSL_KEY_FILE) {
        const cert = fs.readFileSync(SSL_CRT_FILE);
        const key = fs.readFileSync(SSL_KEY_FILE);
        return https.createServer({ key, cert }, app);
      }
      return http.createServer(app);
    })();

    server.listen(PORT, () => {
      const protocol =
        HTTPS_ENABLED && SSL_CRT_FILE && SSL_KEY_FILE ? 'https' : 'http';
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🕐  Sistema de Ponto Eletrônico - API              ║
║                                                       ║
║   📡  Servidor rodando na porta: ${PORT}                ║
║   🌍  Ambiente: ${process.env.NODE_ENV || 'development'}                    ║
║   📚  Documentação: ${protocol}://localhost:${PORT}/api-docs     ║
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
