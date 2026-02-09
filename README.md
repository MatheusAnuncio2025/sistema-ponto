# 🕐 Sistema de Ponto Eletrônico

Sistema completo de gestão de ponto eletrônico com geolocalização, múltiplas escalas, cálculo automático de horas e banco de horas conforme CLT.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação](#documentação)

---

## 📖 Sobre o Projeto

Sistema de ponto eletrônico desenvolvido para atender 55+ funcionários com diferentes tipos de jornada (5x2, 6x1, sábados alternados), incluindo regime híbrido para gestores.

### Problema que resolve:
- ✅ Elimina incerteza sobre sucesso do registro de ponto
- ✅ Reduz discussões sobre marcações incorretas
- ✅ Lembretes inteligentes para evitar esquecimentos
- ✅ Controle de geolocalização
- ✅ Cálculo automático de horas extras e banco de horas
- ✅ Relatórios completos para fechamento de folha

---

## ⚡ Funcionalidades

### Para Funcionários
- 📍 Registro de ponto com feedback garantido (visual + sonoro)
- 📱 Geolocalização automática
- 🔔 Notificações de lembrete personalizáveis
- 📊 Visualização de horas trabalhadas e banco de horas
- 📝 Solicitação de ajustes de ponto
- 📜 Histórico completo de registros

### Para Gestores
- 👥 Dashboard de equipe em tempo real
- ✅ Aprovação de ajustes de ponto
- 📈 Relatórios da equipe
- 🔍 Visualização de atrasos e faltas

### Para Administradores
- ⚙️ Configuração de escalas e jornadas
- 📍 Configuração de locais de trabalho
- 👤 Gestão de funcionários e departamentos
- 📊 Relatórios completos (Excel, PDF, CSV)
- 🔒 Sistema de permissões
- 📋 Logs de auditoria completos

---

## 🛠️ Tecnologias

### Backend
- **Node.js** v18+
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **Sequelize** - ORM
- **JWT** - Autenticação
- **Redis** - Cache e filas
- **Bull** - Gerenciamento de filas de notificações

### Frontend
- **React** v18+
- **TypeScript**
- **Tailwind CSS**
- **React Router** - Navegação
- **Axios** - Requisições HTTP
- **date-fns** - Manipulação de datas

### Ferramentas
- **Docker** & **Docker Compose** - Containerização (opcional)
- **Git** - Controle de versão
- **ESLint** & **Prettier** - Padronização de código

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

### Opção 1: Instalação Nativa (Mac/Windows/Linux)
- [Node.js](https://nodejs.org/) v18 ou superior
- [PostgreSQL](https://www.postgresql.org/download/) v14 ou superior
- [Redis](https://redis.io/download/) v6 ou superior (opcional para desenvolvimento)
- [Git](https://git-scm.com/)

### Opção 2: Com Docker (Recomendado - mais fácil)
- [Docker](https://www.docker.com/get-started/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone [URL_DO_REPOSITORIO]
cd sistema-ponto
```

### 2. Escolha seu método de instalação

#### Opção A: Com Docker (Recomendado) 🐳

```bash
# Inicia todos os serviços (PostgreSQL, Redis, Backend e Frontend)
docker-compose up -d

# Aguarde alguns segundos para os serviços iniciarem
# Acesse: http://localhost:3000
```

Pronto! O sistema estará rodando:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

#### Opção B: Instalação Nativa

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

#### Backend (`backend/.env`)
Copie o arquivo de exemplo e configure:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Servidor
NODE_ENV=development
PORT=5000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_ponto
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d

# Web Push (para notificações)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:seu-email@empresa.com
```

#### Frontend (`frontend/.env`)
```bash
cd frontend
cp .env.example .env
```

Edite o arquivo `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_VAPID_PUBLIC_KEY=
```

### 2. Banco de Dados

#### Com Docker
O banco é criado automaticamente! ✨

#### Sem Docker
Crie o banco de dados manualmente:

```bash
# Acesse o PostgreSQL
psql -U postgres

# Crie o banco
CREATE DATABASE sistema_ponto;

# Saia do psql
\q
```

### 3. Executar Migrations

```bash
cd backend
npm run migrate
```

### 4. Popular Dados Iniciais (Opcional)

```bash
cd backend
npm run seed
```

Isso criará:
- Usuário admin padrão: `admin@empresa.com` / `Admin@123`
- Alguns funcionários de exemplo
- Escalas padrão (5x2, 6x1)

---

## 🏃 Executando o Projeto

### Com Docker

```bash
# Iniciar tudo
docker-compose up

# Em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down
```

### Sem Docker

Você precisará de **3 terminais**:

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

**Terminal 3 - Worker de Notificações (opcional):**
```bash
cd backend
npm run worker
```

### Acessar o Sistema

- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000/api
- **Documentação da API:** http://localhost:5000/api-docs (Swagger)

**Login padrão:**
- Email: `admin@empresa.com`
- Senha: `Admin@123`

---

## 📁 Estrutura do Projeto

```
sistema-ponto/
├── backend/                  # API Node.js + Express
│   ├── src/
│   │   ├── config/          # Configurações (DB, Redis, etc)
│   │   ├── controllers/     # Controladores de rotas
│   │   ├── models/          # Modelos do Sequelize
│   │   ├── routes/          # Definição de rotas
│   │   ├── middlewares/     # Middlewares (auth, validação)
│   │   ├── services/        # Lógica de negócio
│   │   ├── utils/           # Funções utilitárias
│   │   ├── jobs/            # Jobs do Bull (notificações)
│   │   └── app.js           # Aplicação Express
│   ├── migrations/          # Migrations do banco
│   ├── seeders/             # Seeds (dados iniciais)
│   ├── tests/               # Testes automatizados
│   ├── .env.example         # Exemplo de variáveis de ambiente
│   ├── package.json
│   └── README.md
│
├── frontend/                # Interface React
│   ├── public/
│   │   ├── service-worker.js  # Service Worker (PWA + offline)
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas/telas
│   │   ├── contexts/        # Context API (estado global)
│   │   ├── services/        # Serviços (API, notificações)
│   │   ├── utils/           # Funções utilitárias
│   │   ├── styles/          # Estilos globais
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
│
├── docs/                    # Documentação completa
│   ├── DOCUMENTACAO_PROJETO_PONTO.md
│   ├── CHECKLIST_DESENVOLVIMENTO.md
│   ├── api/                 # Documentação da API
│   ├── user-manual/         # Manual do usuário
│   └── admin-manual/        # Manual do administrador
│
├── docker-compose.yml       # Orquestração Docker
├── .gitignore
└── README.md               # Este arquivo
```

---

## 📚 Documentação

### Documentos Principais
- [📋 Documentação Completa do Projeto](docs/DOCUMENTACAO_PROJETO_PONTO.md)
- [✅ Checklist de Desenvolvimento](docs/CHECKLIST_DESENVOLVIMENTO.md)
- [📖 Manual do Usuário](docs/user-manual/) *(em desenvolvimento)*
- [⚙️ Manual do Administrador](docs/admin-manual/) *(em desenvolvimento)*

### API
- Documentação Swagger: http://localhost:5000/api-docs
- Collection do Postman: `docs/postman/`

---

## 🧪 Testes

### Backend
```bash
cd backend
npm test                 # Todos os testes
npm run test:watch       # Modo watch
npm run test:coverage    # Com cobertura
```

### Frontend
```bash
cd frontend
npm test
npm run test:coverage
```

---

## 🔨 Scripts Úteis

### Backend
```bash
npm run dev              # Desenvolvimento com hot reload
npm start                # Produção
npm run migrate          # Executar migrations
npm run migrate:undo     # Desfazer última migration
npm run seed             # Popular dados iniciais
npm run worker           # Iniciar worker de notificações
npm run lint             # Verificar código
npm run format           # Formatar código
```

### Frontend
```bash
npm start                # Desenvolvimento
npm run build            # Build para produção
npm run lint             # Verificar código
npm run format           # Formatar código
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `psql -U postgres -h localhost`

### Erro: "Port 3000 already in use"
- Outro processo está usando a porta 3000
- Mate o processo: `lsof -ti:3000 | xargs kill` (Mac/Linux)
- Ou mude a porta no `frontend/.env`: `PORT=3001`

### Erro: "Redis connection refused"
- Verifique se o Redis está rodando
- Instale se necessário: `brew install redis` (Mac)
- Inicie: `redis-server`

### Notificações não funcionam
- Verifique se tem HTTPS (necessário para Web Push)
- Em desenvolvimento, use localhost (funciona sem HTTPS)
- Confirme que deu permissão no navegador

---

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/MinhaFeature`
3. Commit suas mudanças: `git commit -m 'Adiciona MinhaFeature'`
4. Push para a branch: `git push origin feature/MinhaFeature`
5. Abra um Pull Request

---

## 📝 Git Workflow

```bash
# Antes de começar a trabalhar (em qualquer máquina)
git pull origin main

# Ao terminar o trabalho
git add .
git commit -m "Descrição clara do que foi feito"
git push origin main

# Em outra máquina
git pull origin main
npm install  # Se houver novas dependências
```

---

## 📄 Licença

Este projeto é proprietário da empresa. Todos os direitos reservados.

---

## 👥 Equipe

**Desenvolvedor:** [Seu Nome]  
**Contato:** [seu-email@empresa.com]

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Consulte a [documentação completa](docs/)
2. Verifique os [issues conhecidos](docs/TROUBLESHOOTING.md)
3. Entre em contato com o desenvolvedor

---

**Última atualização:** 29/01/2026
