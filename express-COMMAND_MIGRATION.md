# Migración de Comandos - Medusa.js a Express.js

## 📋 Comparación de Scripts

### Scripts Originales de Medusa.js vs Express.js

| Comando Original (Medusa) | Comando Nuevo (Express) | Descripción |
|----------------------------|--------------------------|-------------|
| `medusa build` | `npm run build` (usa `tsc`) | Compila TypeScript a JavaScript |
| `medusa start` | `npm start` | Inicia el servidor en producción |
| `medusa develop` | `npm run dev` | Modo desarrollo con hot reload |
| `medusa db:migrate` | `npm run migrate` | Ejecuta migraciones de base de datos |
| `medusa db:setup` | `npm run db:setup` | Configura base de datos completa |
| `medusa exec ./src/scripts/seed.ts` | `npm run seed` | Ejecuta el script de seed |
| - | `npm run migrate:generate` | **NUEVO**: Genera migraciones desde schema |
| - | `npm run migrate:reset` | **NUEVO**: Resetea y regenera migraciones |

### Scripts de Testing (Mantenidos Idénticos)

| Comando | Descripción | Estado |
|---------|-------------|--------|
| `npm run test:integration:http` | Tests de integración HTTP | ✅ Mantenido |
| `npm run test:integration:modules` | Tests de integración de módulos | ✅ Mantenido |
| `npm run test:unit` | Tests unitarios | ✅ Mantenido |
| `npm test` | Ejecuta todos los tests | ✅ Mejorado |
| `npm run test:watch` | Tests en modo watch | ✅ Nuevo |
| `npm run test:coverage` | Tests con cobertura | ✅ Nuevo |

### Scripts Mejorados y Nuevos

| Comando | Descripción | Estado |
|---------|-------------|--------|
| `npm run lint` | Linter ESLint | ✅ Nuevo |
| `npm run lint:fix` | Fix automático de linting | ✅ Nuevo |
| `npm run format` | Formateo con Prettier | ✅ Nuevo |
| `npm run clean` | Limpia directorio dist | ✅ Nuevo |
| `npm run health` | Health check del servidor | ✅ Mejorado |
| `npm run deploy:render` | Deploy para Render.com | ✅ Actualizado |

## 🚀 Flujo de Trabajo Completo

### Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración

# 3. Configurar base de datos
npm run db:setup

# 4. Iniciar desarrollo
npm run dev
```

### Producción

```bash
# 1. Construir proyecto
npm run build

# 2. Ejecutar migraciones
npm run migrate

# 3. Iniciar servidor
npm start
```

### Testing

```bash
# Tests básicos
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch (desarrollo)
npm run test:watch

# Tests específicos (como en Medusa)
npm run test:unit
npm run test:integration:http
npm run test:integration:modules
```

## 🔄 Migración Paso a Paso

### 1. Reemplazar package.json

```bash
# Respaldar el original
cp package.json package-medusa.json.backup

# Usar el nuevo package.json de Express
cp express-package.json package.json
```

### 2. Instalar nuevas dependencias

```bash
npm install
```

### 3. Migrar comandos existentes

| Antes | Ahora |
|-------|-------|
| `medusa develop` | `npm run dev` |
| `medusa build` | `npm run build` |
| `medusa start` | `npm start` |
| `medusa db:migrate` | `npm run migrate` |
| `medusa db:setup` | `npm run db:setup` |
| `medusa exec ./src/scripts/seed.ts` | `npm run seed` |

### 4. Nuevos comandos disponibles

```bash
# Generar migraciones desde schema
npm run migrate:generate

# Formatear código
npm run format

# Linting
npm run lint
npm run lint:fix

# Health check
npm run health

# Limpiar build
npm run clean
```

## 🛠️ Scripts Detallados

### Scripts de Base de Datos

```json
{
  "migrate": "tsx src/database/migrate.ts",
  "migrate:generate": "drizzle-kit generate:pg",
  "migrate:reset": "drizzle-kit drop && npm run migrate:generate && npm run migrate",
  "seed": "tsx src/scripts/seed.ts",
  "db:setup": "npm run migrate:generate && npm run migrate && npm run seed"
}
```

### Scripts de Desarrollo

```json
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "clean": "rimraf dist",
  "prebuild": "npm run clean"
}
```

### Scripts de Calidad

```json
{
  "lint": "eslint src --ext .ts,.js",
  "lint:fix": "eslint src --ext .ts,.js --fix",
  "format": "prettier --write src/**/*.{ts,js,json}",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## ⚡ Comandos Equivalentes Rápidos

### Para desarrolladores acostumbrados a Medusa

```bash
# Medusa -> Express
medusa develop    →  npm run dev
medusa build      →  npm run build  
medusa start      →  npm start
medusa db:migrate →  npm run migrate
medusa db:setup   →  npm run db:setup
```

### Comandos de CI/CD

```yaml
# .github/workflows/deploy.yml (ejemplo)
- name: Install dependencies
  run: npm install

- name: Build project
  run: npm run build

- name: Run migrations
  run: npm run migrate

- name: Run tests
  run: npm run test:coverage

- name: Deploy
  run: npm start
```

## 🎯 Beneficios de la Nueva Estructura

### ✅ Ventajas

1. **Comandos estándar npm**: Más familiares para cualquier desarrollador Node.js
2. **Herramientas modernas**: tsx para desarrollo, drizzle-kit para migraciones
3. **Scripts adicionales**: linting, formatting, health checks
4. **Mejor DX**: Hot reload más rápido, mejor logging
5. **Compatibilidad**: Mantiene scripts de testing existentes

### 🔧 Scripts Únicos del Sistema Express

- `migrate:generate`: Auto-genera migraciones desde el schema de Drizzle
- `migrate:reset`: Útil para desarrollo, resetea completamente la DB
- `health`: Verifica el estado del servidor sin hacer deploy
- `clean`: Limpia builds anteriores para compilaciones limpias

## 📝 Notas Importantes

1. **Compatibilidad**: Los tests existentes funcionan sin cambios
2. **Variables de entorno**: Se mantienen las mismas, con algunas nuevas opcionales
3. **Scripts de deploy**: Actualizados para usar los nuevos comandos
4. **Hot reload**: Más rápido con `tsx` vs `medusa develop`
5. **Build**: Más simple con TypeScript directo vs Medusa build process

El nuevo sistema mantiene toda la funcionalidad mientras proporciona mejor experiencia de desarrollo y herramientas más modernas.
