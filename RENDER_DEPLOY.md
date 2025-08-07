# Despliegue en Render.com

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en el dashboard de Render:

### Servidor
```
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
```

### Base de Datos
```
DATABASE_URL=tu_supabase_database_url
DB_HOST=tu_supabase_host
DB_PORT=6543
DB_NAME=postgres
DB_USER=tu_usuario
DB_PASSWORD=tu_password
```

### Seguridad (¡CAMBIAR EN PRODUCCIÓN!)
```
JWT_SECRET=tu_jwt_secret_super_seguro_minimo_32_caracteres
COOKIE_SECRET=tu_cookie_secret_super_seguro_minimo_32_caracteres
BCRYPT_ROUNDS=12
```

### CORS (Actualizar con tus dominios)
```
STORE_CORS=https://tu-frontend.onrender.com,https://tu-dominio.com
ADMIN_CORS=https://tu-backend.onrender.com,https://tu-admin-panel.com
AUTH_CORS=https://tu-backend.onrender.com,https://tu-frontend.onrender.com
```

### Redis (Opcional)
```
# REDIS_URL=redis://tu-redis-host:6379
```

## Configuración en Render

1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Environment**: Node
4. **Node Version**: 20 o superior
5. **Plan**: Free o Starter

## Archivos Importantes

- `package.json` - Configurado para producción
- `express-src/config/index.ts` - Configuración de servidor
- `.env` - Variables locales (no incluir en Git)

## Solución de Problemas

### Error: rimraf not found
- ✅ **Solucionado**: Usamos comandos nativos Node.js en lugar de rimraf

### Error: typescript not found
- ✅ **Solucionado**: TypeScript y @types/node movidos a dependencies

### Error: Cannot find type definition file for 'jest'
- ✅ **Solucionado**: Removido 'jest' de types en tsconfig.json para producción

### Error: Cannot find name 'beforeAll' (tests)
- ✅ **Solucionado**: Excluida carpeta tests del build de producción

### Error: Cannot find type definition file for 'node'
- ✅ **Solucionado**: Removido array `types` completo de tsconfig.json

### Error: Cannot find module 'express/dotenv/joi' etc.
- ✅ **Solucionado**: Movidos TODOS los @types a dependencies
- ✅ **Solucionado**: Creado tsconfig.production.json ultra permisivo
- ✅ **Solucionado**: Declaraciones globales de tipos en types/global.d.ts
- ✅ **Solucionado**: Comando build usa configuración de producción
- ✅ **Solucionado**: skipLibCheck, strict: false y module declarations

### Error: Puerto en uso
- ✅ **Solucionado**: Configurado para usar puerto 10000 en producción

### Error: HOST configuration
- ✅ **Solucionado**: Configurado para usar 0.0.0.0 en producción

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Inicio de producción
npm start

# Health check
curl https://tu-app.onrender.com/health
```

## URLs de Ejemplo

Una vez desplegado, las rutas principales serán:

- Health: `https://tu-app.onrender.com/health`
- Admin Auth: `https://tu-app.onrender.com/admin/auth/token`
- Store: `https://tu-app.onrender.com/store`

## Notas Importantes

1. **Primer despliegue**: Puede tomar varios minutos debido a la instalación de dependencias
2. **Cold starts**: El servicio gratuito tiene cold starts después de inactividad
3. **Base de datos**: Usar Supabase o PostgreSQL externo
4. **Archivos estáticos**: Los uploads se perderán en reinicios (usar servicios externos como Cloudinary)
5. **Logs**: Monitorear logs en el dashboard de Render para debug
