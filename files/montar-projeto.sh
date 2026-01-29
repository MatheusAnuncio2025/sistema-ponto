#!/bin/bash

echo "🚀 Montando estrutura do Sistema de Ponto..."
echo ""

# Criar estrutura de pastas
echo "📁 Criando estrutura de pastas..."

mkdir -p docs/api docs/user-manual docs/admin-manual
mkdir -p backend/src/{config,controllers,models,routes,middlewares,services,utils,jobs}
mkdir -p backend/{migrations,seeders,tests}
mkdir -p frontend/src/{components,pages,contexts,services,utils,types,styles}
mkdir -p frontend/public

echo "✅ Estrutura de pastas criada!"
echo ""

# Mover e renomear arquivos
echo "📄 Organizando arquivos..."

# Raiz
[ -f "gitignore.txt" ] && mv gitignore.txt .gitignore
[ -f "README.md" ] && echo "  ✓ README.md"
[ -f "INICIO-RAPIDO.md" ] && echo "  ✓ INICIO-RAPIDO.md"
[ -f "STATUS-PROJETO.md" ] && echo "  ✓ STATUS-PROJETO.md"
[ -f "docker-compose.yml" ] && echo "  ✓ docker-compose.yml"

# Docs
[ -f "DOCUMENTACAO_PROJETO_PONTO.md" ] && mv DOCUMENTACAO_PROJETO_PONTO.md docs/
[ -f "CHECKLIST_DESENVOLVIMENTO.md" ] && mv CHECKLIST_DESENVOLVIMENTO.md docs/

# Backend
[ -f "backend-package.json" ] && mv backend-package.json backend/package.json
[ -f "backend-env-example.txt" ] && mv backend-env-example.txt backend/.env.example
[ -f "backend-Dockerfile.txt" ] && mv backend-Dockerfile.txt backend/Dockerfile
[ -f "backend-app.js" ] && mv backend-app.js backend/src/app.js
[ -f "backend-server.js" ] && mv backend-server.js backend/src/server.js
[ -f "backend-config-database.js" ] && mv backend-config-database.js backend/src/config/database.js
[ -f "backend-models-index.js" ] && mv backend-models-index.js backend/src/models/index.js

# Frontend
[ -f "frontend-package.json" ] && mv frontend-package.json frontend/package.json
[ -f "frontend-env-example.txt" ] && mv frontend-env-example.txt frontend/.env.example
[ -f "frontend-Dockerfile.txt" ] && mv frontend-Dockerfile.txt frontend/Dockerfile
[ -f "frontend-tsconfig.json" ] && mv frontend-tsconfig.json frontend/tsconfig.json
[ -f "frontend-tailwind.config.js" ] && mv frontend-tailwind.config.js frontend/tailwind.config.js

echo "✅ Arquivos organizados!"
echo ""

# Verificar estrutura
echo "🔍 Verificando estrutura..."
echo ""

if [ -f "backend/package.json" ] && [ -f "frontend/package.json" ]; then
    echo "✅ Estrutura montada com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Leia o arquivo INICIO-RAPIDO.md"
    echo "2. Inicialize o Git: ./init-git.sh"
    echo "3. Crie um repositório no GitHub"
    echo "4. Envie o código: git push"
else
    echo "⚠️  Alguns arquivos podem estar faltando."
    echo "Consulte o GUIA_DE_MONTAGEM.txt"
fi

echo ""
