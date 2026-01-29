# 🚀 GUIA DE INÍCIO RÁPIDO

Este guia vai te ajudar a colocar o projeto no ar em menos de 5 minutos!

## 📋 Pré-requisitos

Escolha UMA das opções abaixo:

### Opção 1: Com Docker (RECOMENDADO - Mais Fácil) 🐳
- Docker Desktop instalado
- Git instalado

### Opção 2: Sem Docker
- Node.js v18+ instalado
- PostgreSQL v14+ instalado e rodando
- Redis instalado (opcional, mas recomendado)
- Git instalado

---

## 🎬 Passo a Passo

### 1. Clone o Repositório

```bash
git clone [URL_DO_SEU_REPOSITORIO]
cd sistema-ponto
```

### 2. Escolha seu Método de Instalação

---

## 🐳 OPÇÃO A: COM DOCKER (Recomendado)

### Passo 1: Configure as Variáveis de Ambiente

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

> 💡 Os valores padrão já funcionam para desenvolvimento local!

### Passo 2: Inicie Tudo com Docker

```bash
docker-compose up -d
```

Isso vai:
- ✅ Criar o banco de dados PostgreSQL
- ✅ Criar o Redis
- ✅ Instalar dependências do backend
- ✅ Instalar dependências do frontend
- ✅ Iniciar backend na porta 5000
- ✅ Iniciar frontend na porta 3000

### Passo 3: Aguarde os Serviços Iniciarem (30-60 segundos)

Veja os logs:
```bash
docker-compose logs -f
```

### Passo 4: Execute as Migrations

```bash
docker-compose exec backend npm run migrate
```

### Passo 5: (Opcional) Popule com Dados de Teste

```bash
docker-compose exec backend npm run seed
```

### ✅ Pronto! Acesse:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Adminer (DB Interface):** http://localhost:8080

**Login padrão:**
- Email: `admin@empresa.com`
- Senha: `Admin@123`

---

## 💻 OPÇÃO B: SEM DOCKER (Instalação Nativa)

### Passo 1: Configure o Banco de Dados

```bash
# Entre no PostgreSQL
psql -U postgres

# Crie o banco
CREATE DATABASE sistema_ponto;

# Saia
\q
```

### Passo 2: Configure as Variáveis de Ambiente

```bash
# Backend
cd backend
cp .env.example .env
```

Edite `backend/.env` e configure:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ponto
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI
```

```bash
# Frontend
cd ../frontend
cp .env.example .env
```

### Passo 3: Instale as Dependências

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### Passo 4: Execute as Migrations

```bash
cd backend
npm run migrate
```

### Passo 5: (Opcional) Popule com Dados de Teste

```bash
npm run seed
```

### Passo 6: Inicie os Serviços

Você vai precisar de **3 terminais**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Redis (se instalado):**
```bash
redis-server
```

### ✅ Pronto! Acesse:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

**Login padrão:**
- Email: `admin@empresa.com`
- Senha: `Admin@123`

---

## 🔄 Trabalhando em Múltiplas Máquinas

### Ao Mudar de Máquina:

**1. Pull das Últimas Mudanças:**
```bash
git pull origin main
```

**2. Instale Novas Dependências (se houver):**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

**3. Execute Novas Migrations (se houver):**
```bash
cd backend
npm run migrate
```

**4. Inicie Normalmente**

### Ao Terminar o Trabalho:

```bash
git add .
git commit -m "Descrição clara do que foi feito"
git push origin main
```

---

## 🆘 Problemas Comuns

### Porta 3000 em uso
```bash
# Mude a porta no frontend/.env
PORT=3001
```

### Porta 5000 em uso
```bash
# Mude a porta no backend/.env
PORT=5001

# E atualize no frontend/.env
REACT_APP_API_URL=http://localhost:5001/api
```

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste: `psql -U postgres -h localhost`

### Docker não inicia
```bash
# Limpe e reconstrua
docker-compose down -v
docker-compose up --build
```

---

## 📞 Precisa de Ajuda?

Consulte:
1. [README.md](README.md) - Documentação completa
2. [docs/DOCUMENTACAO_PROJETO_PONTO.md](docs/DOCUMENTACAO_PROJETO_PONTO.md) - Especificação do projeto
3. [docs/CHECKLIST_DESENVOLVIMENTO.md](docs/CHECKLIST_DESENVOLVIMENTO.md) - Checklist de tarefas

---

**Última atualização:** 29/01/2026
