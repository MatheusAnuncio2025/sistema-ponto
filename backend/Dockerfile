# Base image
FROM node:18-alpine

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 5000

# Comando padrão
CMD ["npm", "run", "dev"]
