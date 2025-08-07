# SIGECOM

Monorepo Front + Back usando Node

## Descripción

Aplicación para la gestión de comunidad

## Tecnologías

- Node.js
  - Backend: Fastify
  - Frontend: React
- Typescript

## Instalación

```bash
# Instalar dependencias del backend
npm run install:backend

# Instalar dependencias del frontend
npm run install:frontend
```

## Construcción
```bash
# Construir backend
npm run build:backend

# Construir frontend
npm run build:frontend
```

## Comandos de inicialización Backend

``` bash
# Inicializar el backend con un admin, columnas escenciales y indice de autoeliminacion para historial
npm run initialize

# Manejo de usuarios
npm run admin-manager
```

## Uso

```bash
# Ejecutar backend en producción
npm run start:backend

# Ejecutar frontend en producción
npm run start:frontend

# Ejecutar backend en desarrollo
npm run dev:backend

# Ejecutar frontend en desarrollo
npm run dev:frontend
```