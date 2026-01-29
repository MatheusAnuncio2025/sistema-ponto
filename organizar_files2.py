#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para organizar arquivos da pasta files2 (Models e Migrations)
"""

import os
import shutil
import sys

# Mapeamento: nome do arquivo na pasta files2 -> destino no projeto
MAPEAMENTO_ARQUIVOS = {
    # Models
    'backend-models-User.js': 'backend/src/models/User.js',
    'backend-models-Employee.js': 'backend/src/models/Employee.js',
    'backend-models-WorkSchedule.js': 'backend/src/models/WorkSchedule.js',
    'backend-models-WorkLocation.js': 'backend/src/models/WorkLocation.js',
    'backend-models-TimeRecord.js': 'backend/src/models/TimeRecord.js',
    'backend-models-Holiday.js': 'backend/src/models/Holiday.js',
    'backend-models-index-UPDATED.js': 'backend/src/models/index.js',
    
    # Configuração Sequelize
    'backend-sequelizerc.txt': 'backend/.sequelizerc',
    
    # Migrations (com renomeação para adicionar timestamp)
    'migration-01-create-users.js': 'backend/migrations/20260129000001-create-users.js',
    'migration-02-create-schedules-locations.js': 'backend/migrations/20260129000002-create-schedules-locations.js',
    'migration-03-create-employees.js': 'backend/migrations/20260129000003-create-employees.js',
    'migration-04-create-time-records.js': 'backend/migrations/20260129000004-create-time-records.js',
    'migration-05-create-holidays.js': 'backend/migrations/20260129000005-create-holidays.js',
    
    # Seeder (com renomeação para adicionar timestamp)
    'seeder-01-initial-data.js': 'backend/seeders/20260129000001-initial-data.js',
}


def copiar_arquivos(pasta_files2):
    """Copia arquivos da pasta files2 para os destinos corretos"""
    print("📄 Copiando e organizando arquivos...\n")
    
    arquivos_copiados = 0
    arquivos_nao_encontrados = []
    
    for origem, destino in MAPEAMENTO_ARQUIVOS.items():
        caminho_origem = os.path.join(pasta_files2, origem)
        
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
        'backend/src/models/User.js',
        'backend/src/models/Employee.js',
        'backend/src/models/WorkSchedule.js',
        'backend/src/models/TimeRecord.js',
        'backend/src/models/index.js',
        'backend/.sequelizerc',
        'backend/migrations/20260129000001-create-users.js',
        'backend/seeders/20260129000001-initial-data.js',
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
    print("🚀 ORGANIZADOR DE ARQUIVOS - MODELS E MIGRATIONS")
    print("=" * 70)
    print()
    
    # Verificar se a pasta files2 existe
    pasta_files2 = 'files2'
    
    # Tentar encontrar a pasta files2
    if not os.path.exists(pasta_files2):
        # Tentar caminho relativo
        possivel_caminho = os.path.join('..', 'files2')
        if os.path.exists(possivel_caminho):
            pasta_files2 = possivel_caminho
        else:
            print(f"❌ Pasta 'files2' não encontrada!")
            print()
            print("Por favor, certifique-se de que:")
            print("1. A pasta 'files2' está no mesmo diretório que este script, OU")
            print("2. Execute este script da pasta pai que contém 'files2/'")
            print()
            print("Estrutura esperada:")
            print("  sistema-ponto/")
            print("  ├── files2/")
            print("  │   ├── backend-models-User.js")
            print("  │   ├── migration-01-create-users.js")
            print("  │   └── ...")
            print("  └── organizar_files2.py  ← Este script")
            print()
            sys.exit(1)
    
    print(f"📂 Pasta encontrada: {os.path.abspath(pasta_files2)}")
    print()
    
    # Listar arquivos encontrados
    arquivos_disponiveis = os.listdir(pasta_files2)
    print(f"📋 Arquivos encontrados na pasta files2: {len(arquivos_disponiveis)}")
    print()
    
    # Verificar se backend existe
    if not os.path.exists('backend'):
        print("❌ Pasta 'backend' não encontrada!")
        print("\nCertifique-se de executar este script da pasta raiz do projeto:")
        print("  cd /Users/matheus-anuncio/Documents/VS\\ Code/sistema-ponto")
        print("  python3 organizar_files2.py")
        sys.exit(1)
    
    print("✅ Pasta 'backend' encontrada")
    print()
    
    try:
        # Copiar arquivos
        sucesso = copiar_arquivos(pasta_files2)
        
        if not sucesso:
            print("\n❌ Nenhum arquivo foi copiado. Verifique a pasta 'files2'.")
            sys.exit(1)
        
        # Verificar
        if verificar_estrutura():
            print("\n" + "=" * 70)
            print("✅ MODELS E MIGRATIONS ORGANIZADOS COM SUCESSO!")
            print("=" * 70)
            print()
            print("📋 Próximos passos:")
            print()
            print("1. Iniciar o Docker:")
            print("   docker-compose up -d")
            print()
            print("2. Aguardar serviços subirem (~30 segundos)")
            print()
            print("3. Rodar migrations (criar tabelas):")
            print("   docker-compose exec backend npm run migrate")
            print()
            print("4. Rodar seeder (dados iniciais):")
            print("   docker-compose exec backend npm run seed")
            print()
            print("5. Testar no navegador:")
            print("   http://localhost:5000/health")
            print()
            print("6. Verificar banco de dados:")
            print("   docker-compose exec postgres psql -U postgres -d sistema_ponto")
            print("   Dentro do psql: \\dt  (listar tabelas)")
            print()
            print("=" * 70)
            print("📧 LOGIN PADRÃO CRIADO PELO SEEDER:")
            print("=" * 70)
            print("   Email: admin@empresa.com")
            print("   Senha: Admin@123")
            print("   Tipo: Administrador")
            print()
            print("✨ Banco de dados pronto para uso!")
            print()
        else:
            print("\n⚠️  Alguns arquivos essenciais estão faltando.")
            print("Verifique se todos os arquivos estão na pasta 'files2'.")
    
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
