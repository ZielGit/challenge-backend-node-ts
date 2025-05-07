# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Compilar TypeScript
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copiar solo lo necesario desde el stage builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.production ./.env

# Puerto expuesto
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["npm", "start"]