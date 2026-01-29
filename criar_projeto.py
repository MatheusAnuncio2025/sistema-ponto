#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para montar a estrutura completa do Sistema de Ponto Eletrônico
Funciona em Windows, Mac e Linux
"""

import os
import sys

def criar_estrutura_pastas():
    """Cria toda a estrutura de pastas do projeto"""
    print("📁 Criando estrutura de pastas...")
    
    pastas = [
        # Documentação
        "docs/api",
        "docs/user-manual",
        "docs/admin-manual",
        
        # Backend
        "backend/src/config",
        "backend/src/controllers",
        "backend/src/models",
        "backend/src/routes",
        "backend/src/middlewares",
        "backend/src/services",
        "backend/src/utils",
        "backend/src/jobs",
        "backend/migrations",
        "backend/seeders",
        "backend/tests",
        
        # Frontend
        "frontend/src/components",
        "frontend/src/pages",
        "frontend/src/contexts",
        "frontend/src/services",
        "frontend/src/utils",
        "frontend/src/types",
        "frontend/src/styles",
        "frontend/public",
    ]
    
    for pasta in pastas:
        os.makedirs(pasta, exist_ok=True)
        print(f"  ✓ {pasta}")
    
    print("✅ Estrutura de pastas criada!\n")


def criar_arquivo(caminho, conteudo):
    """Cria um arquivo com o conteúdo especificado"""
    try:
        # Criar diretórios pai se não existirem
        os.makedirs(os.path.dirname(caminho), exist_ok=True)
        
        with open(caminho, 'w', encoding='utf-8') as f:
            f.write(conteudo)
        print(f"  ✓ {caminho}")
        return True
    except Exception as e:
        print(f"  ✗ Erro ao criar {caminho}: {e}")
        return False


def criar_arquivos_raiz():
    """Cria arquivos da raiz do projeto"""
    print("📄 Criando arquivos da raiz...")
    
    # .gitignore
    gitignore = """# Sistema de Ponto - .gitignore

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Variáveis de Ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Builds
build/
dist/
*.tgz

# Logs
logs/
*.log

# IDEs
.vscode/*
!.vscode/settings.json
.idea/
*.iml
*.sublime-project
*.sublime-workspace

# Sistema Operacional
.DS_Store
Thumbs.db
Desktop.ini

# Testes
coverage/
*.lcov
.nyc_output/

# Docker (volumes locais)
postgres-data/
redis-data/

# Uploads (temporários)
uploads/temp/
uploads/cache/
"""
    criar_arquivo('.gitignore', gitignore)
    
    # docker-compose.yml
    docker_compose = """version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sistema-ponto-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sistema_ponto
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - sistema-ponto-network

  redis:
    image: redis:7-alpine
    container_name: sistema-ponto-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - sistema-ponto-network

volumes:
  postgres-data:
  redis-data:

networks:
  sistema-ponto-network:
    driver: bridge
"""
    criar_arquivo('docker-compose.yml', docker_compose)
    
    print("✅ Arquivos da raiz criados!\n")


def criar_arquivos_backend():
    """Cria arquivos do backend"""
    print("📄 Criando arquivos do backend...")
    
    # package.json
    package_json = """{
  "name": "sistema-ponto-backend",
  "version": "1.0.0",
  "description": "Backend do Sistema de Ponto Eletrônico",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all",
    "test": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.35.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "date-fns": "^3.0.6",
    "redis": "^4.6.12",
    "bull": "^4.12.0",
    "web-push": "^3.6.6",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.1",
    "exceljs": "^4.4.0",
    "pdfkit": "^0.14.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "sequelize-cli": "^6.6.2",
    "jest": "^29.7.0"
  }
}
"""
    criar_arquivo('backend/package.json', package_json)
    
    # .env.example
    env_example = """NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ponto
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=sua_chave_secreta_muito_segura_mude_isso
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
TZ=America/Sao_Paulo
"""
    criar_arquivo('backend/.env.example', env_example)
    
    # Dockerfile
    dockerfile = """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]
"""
    criar_arquivo('backend/Dockerfile', dockerfile)
    
    # src/server.js
    server_js = """require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
"""
    criar_arquivo('backend/src/server.js', server_js)
    
    # src/app.js
    app_js = """require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Sistema de Ponto Eletrônico API',
    version: '1.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

module.exports = app;
"""
    criar_arquivo('backend/src/app.js', app_js)
    
    # src/config/database.js
    database_js = """require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sistema_ponto',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    timezone: '+00:00',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    timezone: '+00:00',
  },
};
"""
    criar_arquivo('backend/src/config/database.js', database_js)
    
    # src/models/index.js
    models_index = """const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
  }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
"""
    criar_arquivo('backend/src/models/index.js', models_index)
    
    print("✅ Arquivos do backend criados!\n")


def criar_arquivos_frontend():
    """Cria arquivos do frontend"""
    print("📄 Criando arquivos do frontend...")
    
    # package.json
    package_json = """{
  "name": "sistema-ponto-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "axios": "^1.6.5",
    "date-fns": "^3.0.6",
    "react-toastify": "^10.0.3",
    "react-icons": "^5.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "react-scripts": "5.0.1",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}
"""
    criar_arquivo('frontend/package.json', package_json)
    
    # .env.example
    env_example = """REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Sistema de Ponto
"""
    criar_arquivo('frontend/.env.example', env_example)
    
    # Dockerfile
    dockerfile = """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
"""
    criar_arquivo('frontend/Dockerfile', dockerfile)
    
    # tsconfig.json
    tsconfig = """{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": "src"
  },
  "include": ["src"]
}
"""
    criar_arquivo('frontend/tsconfig.json', tsconfig)
    
    # tailwind.config.js
    tailwind_config = """module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
"""
    criar_arquivo('frontend/tailwind.config.js', tailwind_config)
    
    print("✅ Arquivos do frontend criados!\n")


def main():
    """Função principal"""
    print("=" * 60)
    print("🚀 MONTANDO SISTEMA DE PONTO ELETRÔNICO")
    print("=" * 60)
    print()
    
    try:
        # Verificar se já existe uma estrutura
        if os.path.exists('backend') or os.path.exists('frontend'):
            resposta = input("⚠️  Já existe uma estrutura aqui. Sobrescrever? (s/n): ")
            if resposta.lower() != 's':
                print("Operação cancelada.")
                return
        
        # Criar estrutura
        criar_estrutura_pastas()
        criar_arquivos_raiz()
        criar_arquivos_backend()
        criar_arquivos_frontend()
        
        print("=" * 60)
        print("✅ PROJETO MONTADO COM SUCESSO!")
        print("=" * 60)
        print()
        print("📋 Próximos passos:")
        print("1. Inicialize o Git: git init")
        print("2. Adicione os arquivos: git add .")
        print("3. Faça o commit: git commit -m 'Initial commit'")
        print("4. Crie um repositório no GitHub")
        print("5. Conecte: git remote add origin [URL]")
        print("6. Envie: git push -u origin main")
        print()
        print("Para rodar o projeto, consulte o README.md")
        print()
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
