# 🚀 Instrucciones de Configuración Express.js

## ✅ Rutas Corregidas

Todos los archivos de configuración han sido actualizados para usar las rutas correctas (`express-src/` en lugar de `src/`).

## 📋 Pasos para Configurar el Proyecto

### Paso 1: Copiar Archivos de Configuración

```bash
# Respaldar archivos originales
cp package.json package-medusa.json.backup
cp tsconfig.json tsconfig-medusa.json.backup

# Copiar nuevos archivos de configuración (quitar prefijo "express-")
cp express-package.json package.json
cp express-tsconfig.json tsconfig.json
cp express-jest.config.js jest.config.js
cp express-drizzle.config.ts drizzle.config.ts
cp express-.env.example .env.example
cp express-README.md README.md
```

### Paso 2: Renombrar Directorio de Código

```bash
# Renombrar express-src a src
mv express-src src
```

**O si prefieres mantener el nombre express-src**, los archivos ya están configurados para usar esa ruta.

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar y editar variables de entorno
cp .env.example .env
```

Edita el archivo `.env` con tu configuración:

```env
# Configuración básica requerida
DATABASE_URL=postgresql://username:password@localhost:5432/express_ecommerce
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
COOKIE_SECRET=your-super-secret-cookie-key-minimum-32-chars

# CORS (ajustar a tus URLs)
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:3001
AUTH_CORS=http://localhost:3000

# Opcional
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
PORT=9000
```

### Paso 4: Instalar Dependencias

```bash
npm install
```

### Paso 5: Configurar Base de Datos

```bash
# Generar migraciones desde el schema
npm run migrate:generate

# Ejecutar migraciones
npm run migrate

# Poblar con datos de ejemplo
npm run seed
```

**O todo en un comando:**

```bash
npm run db:setup
```

### Paso 6: Iniciar el Servidor

```bash
# Desarrollo (con hot reload)
npm run dev

# O en producción
npm run build
npm start
```

## 🧪 Verificar que Todo Funciona

### 1. Health Check

```bash
# Verificar que el servidor esté funcionando
curl http://localhost:9000/health

# O abrir en navegador:
# http://localhost:9000/health
```

### 2. Verificar Endpoints Principales

```bash
# Admin API
curl http://localhost:9000/admin/custom

# Store API  
curl http://localhost:9000/store/custom

# Health detallado
curl http://localhost:9000/health/detailed
```

### 3. Ejecutar Tests

```bash
npm test
```

## 📁 Estructura Final de Archivos

```
tu-proyecto/
├── src/                          # (renombrado desde express-src)
│   ├── config/index.ts          # ✅ Configuración
│   ├── database/                # ✅ Base de datos
│   │   ├── schema.ts
│   │   ├── connection.ts
│   │   └── migrate.ts
│   ├── routes/                  # ✅ Rutas API
│   │   ├── health.ts
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   └── store.ts
│   ├── middleware/              # ✅ Middleware
│   ├── utils/                   # ✅ Utilidades
│   ├── scripts/seed.ts          # ✅ Script de seed
│   ├── tests/setup.ts           # ✅ Setup de tests
│   └── server.ts               # ✅ Servidor principal
├── package.json                 # ✅ Scripts corregidos
├── tsconfig.json               # ✅ Paths corregidos
├── jest.config.js              # ✅ Configuración de tests
├── drizzle.config.ts           # ✅ Configuración ORM
├── .env.example                # ✅ Variables de entorno
└── README.md                   # ✅ Documentación
```

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor con hot reload
npm run build           # Compila TypeScript
npm start               # Inicia servidor de producción

# Base de datos
npm run migrate:generate # Genera migraciones desde schema
npm run migrate         # Ejecuta migraciones
npm run seed            # Pobla datos de ejemplo
npm run db:setup        # Todo lo anterior en un comando

# Testing
npm test                # Ejecuta todos los tests
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Tests con cobertura

# Calidad de código
npm run lint            # Ejecuta ESLint
npm run lint:fix        # Fix automático de linting
npm run format          # Formateo con Prettier

# Utilidades
npm run clean           # Limpia directorio dist
npm run health          # Health check del servidor
```

## 🔧 Comandos Equivalentes

| Antes (Medusa) | Ahora (Express) |
|----------------|-----------------|
| `medusa develop` | `npm run dev` |
| `medusa build` | `npm run build` |
| `medusa start` | `npm start` |
| `medusa db:migrate` | `npm run migrate` |
| `medusa db:setup` | `npm run db:setup` |
| `medusa exec ./src/scripts/seed.ts` | `npm run seed` |

## ⚠️ Notas Importantes

1. **Base de datos**: Asegúrate de que PostgreSQL esté corriendo y la `DATABASE_URL` sea correcta
2. **Secretos**: Los `JWT_SECRET` y `COOKIE_SECRET` deben tener al menos 32 caracteres
3. **Puerto**: Por defecto usa el puerto 9000 (configurable en .env)
4. **CORS**: Ajusta las URLs de CORS según tu frontend
5. **Redis**: Es opcional, pero recomendado para producción

## 🆘 Solución de Problemas

### Error: "Cannot find module"

```bash
# Verificar que todos los archivos estén en su lugar
ls -la src/
ls -la src/config/
```

### Error: "Database connection failed"

```bash
# Verificar conexión a PostgreSQL
psql $DATABASE_URL -c "SELECT 1;"
```

### Error: "JWT_SECRET too short"

```bash
# Generar un secreto más largo
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "COOKIE_SECRET=$(openssl rand -base64 32)" >> .env
```

¡El sistema está listo para funcionar con todas las rutas corregidas! 🎉
