#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para inicializar Git e fazer o primeiro commit automaticamente
"""

import subprocess
import sys
import os

def executar_comando(comando, descricao):
    """Executa um comando e mostra o resultado"""
    print(f"\n{descricao}")
    print(f"$ {comando}")
    print("-" * 60)
    
    try:
        resultado = subprocess.run(
            comando,
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        
        if resultado.stdout:
            print(resultado.stdout)
        
        print("✅ Sucesso!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro: {e}")
        if e.stderr:
            print(e.stderr)
        return False


def verificar_git():
    """Verifica se o Git está instalado"""
    try:
        subprocess.run(
            "git --version",
            shell=True,
            check=True,
            capture_output=True
        )
        return True
    except:
        return False


def verificar_git_config():
    """Verifica se o Git está configurado"""
    try:
        resultado = subprocess.run(
            "git config --global user.name",
            shell=True,
            capture_output=True,
            text=True
        )
        
        if resultado.stdout.strip():
            return True
        return False
    except:
        return False


def configurar_git():
    """Configura nome e email do Git"""
    print("\n" + "=" * 60)
    print("CONFIGURAÇÃO DO GIT")
    print("=" * 60)
    
    print("\nPara usar o Git, precisamos configurar seu nome e email.")
    print("Use o MESMO email da sua conta do GitHub!\n")
    
    nome = input("Digite seu nome: ").strip()
    email = input("Digite seu email: ").strip()
    
    if not nome or not email:
        print("❌ Nome e email são obrigatórios!")
        return False
    
    # Configurar
    subprocess.run(f'git config --global user.name "{nome}"', shell=True)
    subprocess.run(f'git config --global user.email "{email}"', shell=True)
    
    print(f"\n✅ Git configurado!")
    print(f"   Nome: {nome}")
    print(f"   Email: {email}")
    
    return True


def main():
    """Função principal"""
    print("=" * 60)
    print("🚀 INICIALIZAÇÃO DO GIT - SISTEMA DE PONTO")
    print("=" * 60)
    
    # Verificar se Git está instalado
    if not verificar_git():
        print("\n❌ Git não está instalado!")
        print("\nInstale o Git primeiro:")
        print("  Mac: brew install git")
        print("  Windows: https://git-scm.com/download/win")
        sys.exit(1)
    
    print("\n✅ Git está instalado")
    
    # Verificar se Git está configurado
    if not verificar_git_config():
        print("\n⚠️  Git não está configurado")
        if not configurar_git():
            sys.exit(1)
    else:
        # Mostrar configuração atual
        nome = subprocess.run(
            "git config --global user.name",
            shell=True,
            capture_output=True,
            text=True
        ).stdout.strip()
        
        email = subprocess.run(
            "git config --global user.email",
            shell=True,
            capture_output=True,
            text=True
        ).stdout.strip()
        
        print(f"\n✅ Git já está configurado:")
        print(f"   Nome: {nome}")
        print(f"   Email: {email}")
    
    # Verificar se já é um repositório Git
    if os.path.exists('.git'):
        print("\n⚠️  Este diretório já é um repositório Git!")
        resposta = input("Deseja reinicializar? (isso é PERIGOSO!) (s/n): ")
        if resposta.lower() != 's':
            print("Operação cancelada.")
            sys.exit(0)
    
    print("\n" + "=" * 60)
    print("INICIALIZANDO REPOSITÓRIO GIT")
    print("=" * 60)
    
    # 1. Inicializar Git
    if not executar_comando("git init", "1️⃣  Inicializando repositório Git..."):
        sys.exit(1)
    
    # 2. Adicionar todos os arquivos
    if not executar_comando("git add .", "2️⃣  Adicionando todos os arquivos..."):
        sys.exit(1)
    
    # 3. Fazer primeiro commit
    mensagem = "🎉 Initial commit: Estrutura base do Sistema de Ponto Eletrônico"
    if not executar_comando(
        f'git commit -m "{mensagem}"',
        "3️⃣  Fazendo primeiro commit..."
    ):
        sys.exit(1)
    
    # 4. Renomear branch para main
    executar_comando("git branch -M main", "4️⃣  Renomeando branch para 'main'...")
    
    # Sucesso!
    print("\n" + "=" * 60)
    print("✅ GIT INICIALIZADO COM SUCESSO!")
    print("=" * 60)
    
    print("\n📋 PRÓXIMOS PASSOS:\n")
    
    print("1️⃣  Criar repositório no GitHub:")
    print("   Acesse: https://github.com/new")
    print("   Nome: sistema-ponto")
    print("   ⚠️  NÃO marque: README, .gitignore ou license")
    print()
    
    print("2️⃣  Conectar com o GitHub:")
    print("   Após criar, copie a URL do repositório e execute:")
    print()
    print("   git remote add origin https://github.com/SEU-USUARIO/sistema-ponto.git")
    print("   git push -u origin main")
    print()
    
    print("3️⃣  Verificar no GitHub:")
    print("   Acesse: https://github.com/SEU-USUARIO/sistema-ponto")
    print("   Seus arquivos devem estar lá!")
    print()
    
    print("=" * 60)
    print()
    
    # Perguntar se quer conectar agora
    print("Deseja conectar com o GitHub agora? (Você precisa ter criado o repositório)")
    resposta = input("(s/n): ")
    
    if resposta.lower() == 's':
        print()
        url = input("Cole a URL do repositório (ex: https://github.com/usuario/sistema-ponto.git): ")
        url = url.strip()
        
        if url:
            print()
            if executar_comando(
                f'git remote add origin {url}',
                "5️⃣  Conectando com o GitHub..."
            ):
                print()
                executar_comando(
                    "git push -u origin main",
                    "6️⃣  Enviando código para o GitHub..."
                )
                
                print("\n" + "=" * 60)
                print("🎉 PROJETO NO GITHUB!")
                print("=" * 60)
                print(f"\nAcesse: {url.replace('.git', '')}")
    
    print("\n✨ Tudo pronto! Boa codificação! 🚀\n")


if __name__ == "__main__":
    main()