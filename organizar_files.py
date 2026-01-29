#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para organizar arquivos da pasta /files para a estrutura correta do projeto
"""

import os
import shutil
import sys

# Mapeamento: nome do arquivo na pasta files -> destino no projeto
MAPEAMENTO_ARQUIVOS = {
    # Arquivos da raiz
    'README.md': 'README.md',
    'INICIO-RAPIDO.md': 'INICIO-RAPIDO.md',
    'STATUS-PROJETO.md': 'STATUS-PROJETO.md',
    'gitignore.txt': '.gitignore',
    'docker-compose.yml': 'docker-compose.yml',
    
    # Documentação
    'DOCUMENTACAO_PROJETO_PONTO.md': 'docs/DOCUMENTACAO_PROJETO_PONTO.md',
    'CHECKLIST_DESENVOLVIMENTO.md': 'docs/CHECKLIST_DESENVOLVIMENTO.md',
    
    # Backend - raiz
    'backend-package.json': 'backend/package.json',
    'backend-env-example.txt': 'backend/.env.example',
    'backend-Dockerfile.txt': 'backend/Dockerfile',
    
    # Backend - src
    'backend-app.js': 'backend/src/app.js',
    'backend-server.js': 'backend/src/server.js',
    
    # Backend - config
    'backend-config-database.js': 'backend/src/config/database.js',
    
    # Backend - models
    'backend-models-index.js': 'backend/src/models/index.js',
    
    # Frontend - raiz
    'frontend-package.json': 'frontend/package.json',
    'frontend-env-example.txt': 'frontend/.env.example',
    'frontend-Dockerfile.txt': 'frontend/Dockerfile',
    'frontend-tsconfig.json': 'frontend/tsconfig.json',
    'frontend-tailwind.config.js': 'frontend/tailwind.config.js',
}


def criar_estrutura_pastas():
    """Cria toda a estrutura de pastas necessária"""
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
    
    print("✅ Estrutura de pastas criada!\n")


def copiar_arquivos(pasta_files):
    """Copia arquivos da pasta files para os destinos corretos"""
    print("📄 Copiando e organizando arquivos...\n")
    
    arquivos_copiados = 0
    arquivos_nao_encontrados = []
    
    for origem, destino in MAPEAMENTO_ARQUIVOS.items():
        caminho_origem = os.path.join(pasta_files, origem)
        
        if os.path.exists(caminho_origem):
            # Criar diretórios pai do destino se não existirem
            dir_destino = os.path.dirname(destino)
            if dir_destino:
                os.makedirs(dir_destino, exist_ok=True)
            
            # Copiar arquivo
            shutil.copy2(caminho_origem, destino)
            print(f"  ✓ {origem} → {destino}")
            arquivos_copiados += 1
        else:
            arquivos_nao_encontrados.append(origem)
            print(f"  ⚠️  Não encontrado: {origem}")
    
    print(f"\n✅ {arquivos_copiados} arquivos copiados com sucesso!")
    
    if arquivos_nao_encontrados:
        print(f"\n⚠️  {len(arquivos_nao_encontrados)} arquivos não encontrados:")
        for arquivo in arquivos_nao_encontrados:
            print(f"   - {arquivo}")
    
    return arquivos_copiados > 0


def verificar_estrutura():
    """Verifica se a estrutura foi criada corretamente"""
    print("\n🔍 Verificando estrutura...\n")
    
    arquivos_essenciais = [
        'backend/package.json',
        'backend/src/app.js',
        'backend/src/server.js',
        'frontend/package.json',
        'docker-compose.yml',
        '.gitignore'
    ]
    
    todos_presentes = True
    for arquivo in arquivos_essenciais:
        existe = os.path.exists(arquivo)
        status = "✓" if existe else "✗"
        print(f"  {status} {arquivo}")
        if not existe:
            todos_presentes = False
    
    return todos_presentes


def main():
    """Função principal"""
    print("=" * 70)
    print("🚀 ORGANIZADOR DE ARQUIVOS - SISTEMA DE PONTO ELETRÔNICO")
    print("=" * 70)
    print()
    
    # Verificar se a pasta files existe
    pasta_files = 'files'
    
    # Tentar encontrar a pasta files
    if not os.path.exists(pasta_files):
        # Tentar caminho relativo
        possivel_caminho = os.path.join('..', 'files')
        if os.path.exists(possivel_caminho):
            pasta_files = possivel_caminho
        else:
            print(f"❌ Pasta 'files' não encontrada!")
            print()
            print("Por favor, certifique-se de que:")
            print("1. A pasta 'files' está no mesmo diretório que este script, OU")
            print("2. Execute este script da pasta pai que contém 'files/'")
            print()
            print("Estrutura esperada:")
            print("  sistema-ponto/")
            print("  ├── files/")
            print("  │   ├── README.md")
            print("  │   ├── backend-package.json")
            print("  │   └── ...")
            print("  └── organizar_files.py  ← Este script")
            print()
            sys.exit(1)
    
    print(f"📂 Pasta encontrada: {os.path.abspath(pasta_files)}")
    print()
    
    # Listar arquivos encontrados
    arquivos_disponiveis = os.listdir(pasta_files)
    print(f"📋 Arquivos encontrados na pasta files: {len(arquivos_disponiveis)}")
    print()
    
    # Verificar se já existe estrutura
    if os.path.exists('backend') or os.path.exists('frontend'):
        print("⚠️  Já existe uma estrutura aqui!")
        resposta = input("Deseja sobrescrever? (s/n): ")
        if resposta.lower() != 's':
            print("Operação cancelada.")
            sys.exit(0)
        print()
    
    try:
        # Criar estrutura
        criar_estrutura_pastas()
        
        # Copiar arquivos
        sucesso = copiar_arquivos(pasta_files)
        
        if not sucesso:
            print("\n❌ Nenhum arquivo foi copiado. Verifique a pasta 'files'.")
            sys.exit(1)
        
        # Verificar
        if verificar_estrutura():
            print("\n" + "=" * 70)
            print("✅ PROJETO ORGANIZADO COM SUCESSO!")
            print("=" * 70)
            print()
            print("📋 Próximos passos:")
            print()
            print("1. Inicialize o Git:")
            print("   git init")
            print("   git add .")
            print("   git commit -m '🎉 Initial commit: Estrutura base'")
            print()
            print("2. Crie um repositório no GitHub (github.com/new)")
            print()
            print("3. Conecte e envie:")
            print("   git remote add origin [URL_DO_REPOSITORIO]")
            print("   git branch -M main")
            print("   git push -u origin main")
            print()
            print("4. Para rodar o projeto:")
            print("   - Com Docker: docker-compose up -d")
            print("   - Sem Docker: Consulte o INICIO-RAPIDO.md")
            print()
        else:
            print("\n⚠️  Alguns arquivos essenciais estão faltando.")
            print("Verifique se todos os arquivos estão na pasta 'files'.")
    
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
