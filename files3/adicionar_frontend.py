#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para adicionar arquivos básicos do Frontend
Funciona de dentro da pasta files3
"""

import os
import shutil
import sys

# Mapeamento de arquivos
ARQUIVOS = {
    'frontend-public-index.html': '../frontend/public/index.html',
    'frontend-src-index.tsx': '../frontend/src/index.tsx',
    'frontend-src-App.tsx': '../frontend/src/App.tsx',
    'frontend-src-styles-index.css': '../frontend/src/styles/index.css',
    'frontend-postcss.config.js': '../frontend/postcss.config.js',
}

def copiar_arquivos():
    """Copia arquivos para os destinos corretos"""
    print("📄 Copiando arquivos do frontend...\n")
    
    arquivos_copiados = 0
    arquivos_nao_encontrados = []
    
    for origem, destino in ARQUIVOS.items():
        if os.path.exists(origem):
            # Criar diretórios pai se não existirem
            dir_destino = os.path.dirname(destino)
            if dir_destino:
                os.makedirs(dir_destino, exist_ok=True)
            
            # Copiar arquivo
            shutil.copy2(origem, destino)
            print(f"  ✓ {origem} → {destino}")
            arquivos_copiados += 1
        else:
            arquivos_nao_encontrados.append(origem)
            print(f"  ⚠️  Não encontrado: {origem}")
    
    print(f"\n✅ {arquivos_copiados} arquivos copiados!")
    
    if arquivos_nao_encontrados:
        print(f"\n⚠️  {len(arquivos_nao_encontrados)} arquivos não encontrados:")
        for arquivo in arquivos_nao_encontrados:
            print(f"   - {arquivo}")
    
    return arquivos_copiados > 0


def verificar_estrutura():
    """Verifica se está na pasta correta"""
    # Verificar se estamos na pasta files3
    pasta_atual = os.path.basename(os.getcwd())
    
    if pasta_atual != 'files3':
        print("❌ Este script deve ser executado de dentro da pasta files3!")
        print("\nExecute:")
        print("  cd files3")
        print("  python3 adicionar_frontend.py")
        return False
    
    # Verificar se a pasta frontend existe no nível acima
    if not os.path.exists('../frontend'):
        print("❌ Pasta 'frontend' não encontrada no diretório pai!")
        print("\nEstrutura esperada:")
        print("  sistema-ponto/")
        print("  ├── frontend/")
        print("  └── files3/")
        print("      ├── adicionar_frontend.py")
        print("      └── ... (arquivos)")
        return False
    
    return True


def main():
    """Função principal"""
    print("=" * 70)
    print("🚀 ADICIONAR ARQUIVOS DO FRONTEND")
    print("=" * 70)
    print()
    
    # Verificar estrutura
    if not verificar_estrutura():
        sys.exit(1)
    
    print("✅ Estrutura correta encontrada")
    print()
    
    # Listar arquivos disponíveis
    arquivos_disponiveis = [f for f in os.listdir('.') if f.startswith('frontend-')]
    print(f"📋 Arquivos encontrados na pasta files3: {len(arquivos_disponiveis)}")
    for arquivo in arquivos_disponiveis:
        print(f"   - {arquivo}")
    print()
    
    try:
        # Copiar arquivos
        if not copiar_arquivos():
            print("\n❌ Nenhum arquivo foi copiado.")
            print("Verifique se todos os arquivos estão na pasta files3:")
            for origem in ARQUIVOS.keys():
                print(f"   - {origem}")
            sys.exit(1)
        
        print("\n" + "=" * 70)
        print("✅ ARQUIVOS DO FRONTEND ADICIONADOS!")
        print("=" * 70)
        print()
        print("📋 Próximos passos:")
        print()
        print("1. Voltar para a pasta raiz:")
        print("   cd ..")
        print()
        print("2. Reconstruir o container do frontend:")
        print("   docker-compose down")
        print("   docker-compose build frontend")
        print("   docker-compose up -d")
        print()
        print("3. Ver logs:")
        print("   docker-compose logs -f frontend")
        print()
        print("4. Acessar no navegador:")
        print("   http://localhost:3000")
        print()
    
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()