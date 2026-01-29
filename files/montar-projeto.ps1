# Script PowerShell para montar estrutura do Sistema de Ponto no Windows

Write-Host "🚀 Montando estrutura do Sistema de Ponto..." -ForegroundColor Green
Write-Host ""

# Criar estrutura de pastas
Write-Host "📁 Criando estrutura de pastas..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "docs/api" | Out-Null
New-Item -ItemType Directory -Force -Path "docs/user-manual" | Out-Null
New-Item -ItemType Directory -Force -Path "docs/admin-manual" | Out-Null

New-Item -ItemType Directory -Force -Path "backend/src/config" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/controllers" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/models" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/routes" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/middlewares" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/services" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/utils" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/jobs" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/migrations" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/seeders" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/tests" | Out-Null

New-Item -ItemType Directory -Force -Path "frontend/src/components" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/pages" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/contexts" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/services" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/utils" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/types" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/styles" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/public" | Out-Null

Write-Host "✅ Estrutura de pastas criada!" -ForegroundColor Green
Write-Host ""

# Mover e renomear arquivos
Write-Host "📄 Organizando arquivos..." -ForegroundColor Cyan

# Raiz
if (Test-Path "gitignore.txt") { Move-Item -Force "gitignore.txt" ".gitignore" }
if (Test-Path "README.md") { Write-Host "  ✓ README.md" -ForegroundColor Gray }
if (Test-Path "INICIO-RAPIDO.md") { Write-Host "  ✓ INICIO-RAPIDO.md" -ForegroundColor Gray }
if (Test-Path "STATUS-PROJETO.md") { Write-Host "  ✓ STATUS-PROJETO.md" -ForegroundColor Gray }
if (Test-Path "docker-compose.yml") { Write-Host "  ✓ docker-compose.yml" -ForegroundColor Gray }

# Docs
if (Test-Path "DOCUMENTACAO_PROJETO_PONTO.md") { 
    Move-Item -Force "DOCUMENTACAO_PROJETO_PONTO.md" "docs/"
}
if (Test-Path "CHECKLIST_DESENVOLVIMENTO.md") { 
    Move-Item -Force "CHECKLIST_DESENVOLVIMENTO.md" "docs/"
}

# Backend
if (Test-Path "backend-package.json") { 
    Move-Item -Force "backend-package.json" "backend/package.json"
}
if (Test-Path "backend-env-example.txt") { 
    Move-Item -Force "backend-env-example.txt" "backend/.env.example"
}
if (Test-Path "backend-Dockerfile.txt") { 
    Move-Item -Force "backend-Dockerfile.txt" "backend/Dockerfile"
}
if (Test-Path "backend-app.js") { 
    Move-Item -Force "backend-app.js" "backend/src/app.js"
}
if (Test-Path "backend-server.js") { 
    Move-Item -Force "backend-server.js" "backend/src/server.js"
}
if (Test-Path "backend-config-database.js") { 
    Move-Item -Force "backend-config-database.js" "backend/src/config/database.js"
}
if (Test-Path "backend-models-index.js") { 
    Move-Item -Force "backend-models-index.js" "backend/src/models/index.js"
}

# Frontend
if (Test-Path "frontend-package.json") { 
    Move-Item -Force "frontend-package.json" "frontend/package.json"
}
if (Test-Path "frontend-env-example.txt") { 
    Move-Item -Force "frontend-env-example.txt" "frontend/.env.example"
}
if (Test-Path "frontend-Dockerfile.txt") { 
    Move-Item -Force "frontend-Dockerfile.txt" "frontend/Dockerfile"
}
if (Test-Path "frontend-tsconfig.json") { 
    Move-Item -Force "frontend-tsconfig.json" "frontend/tsconfig.json"
}
if (Test-Path "frontend-tailwind.config.js") { 
    Move-Item -Force "frontend-tailwind.config.js" "frontend/tailwind.config.js"
}

Write-Host "✅ Arquivos organizados!" -ForegroundColor Green
Write-Host ""

# Verificar estrutura
Write-Host "🔍 Verificando estrutura..." -ForegroundColor Cyan
Write-Host ""

if ((Test-Path "backend/package.json") -and (Test-Path "frontend/package.json")) {
    Write-Host "✅ Estrutura montada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Leia o arquivo INICIO-RAPIDO.md"
    Write-Host "2. Inicialize o Git: git init"
    Write-Host "3. Crie um repositório no GitHub"
    Write-Host "4. Envie o código: git push"
} else {
    Write-Host "⚠️  Alguns arquivos podem estar faltando." -ForegroundColor Yellow
    Write-Host "Consulte o GUIA_DE_MONTAGEM.txt"
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
