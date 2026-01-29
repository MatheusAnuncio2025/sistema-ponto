require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// ===========================
// MIDDLEWARES DE SEGURANÇA
// ===========================
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ===========================
// MIDDLEWARES GERAIS
// ===========================
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ===========================
// ROTA DE HEALTH CHECK
// ===========================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
  });
});

// ===========================
// ROTAS DA API
// ===========================
// TODO: Importar e registrar rotas aqui
// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// ...
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

// Rota raiz da API
app.get('/api', (req, res) => {
  res.json({
    message: 'Sistema de Ponto Eletrônico API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// ===========================
// SWAGGER (Documentação)
// ===========================
// TODO: Configurar Swagger
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./config/swagger');
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ===========================
// TRATAMENTO DE ERROS 404
// ===========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

// ===========================
// MIDDLEWARE DE ERRO GLOBAL
// ===========================
app.use((err, req, res, next) => {
  console.error('Erro:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
