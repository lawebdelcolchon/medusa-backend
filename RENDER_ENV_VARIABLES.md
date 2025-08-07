# VARIABLES DE ENTORNO PARA RENDER.COM

## 🚀 CONFIGURACIÓN DEL SERVIDOR

```
NODE_ENV=production
PORT=10000
HOST=0.0.0.0
```

## 🔒 SEGURIDAD (¡CAMBIAR EN PRODUCCIÓN!)

```
JWT_SECRET=your-super-secure-jwt-secret-for-production-minimum-32-characters-long-please-change-this
COOKIE_SECRET=your-super-secure-cookie-secret-for-production-minimum-32-characters-long-please-change
BCRYPT_ROUNDS=12
```

## 🗄️ BASE DE DATOS (SUPABASE)

```
DATABASE_URL=postgresql://postgres.zkoghgwrsbqjaquqpqlr:BKX2c523ucA*LQC@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=disable&pgbouncer=true
DB_HOST=aws-0-eu-west-2.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.zkoghgwrsbqjaquqpqlr
DB_PASSWORD=BKX2c523ucA*LQC
```

## 🌐 CORS (Actualizar con tus dominios reales)

```
STORE_CORS=https://tu-frontend.onrender.com,https://tu-dominio.com,http://localhost:3000
ADMIN_CORS=https://tu-backend.onrender.com,https://tu-admin-panel.com,http://localhost:5173
AUTH_CORS=https://tu-backend.onrender.com,https://tu-frontend.onrender.com,http://localhost:9000
```

## 📊 LOGGING

```
LOG_LEVEL=info
LOG_FORMAT=combined
```

## ⚡ RATE LIMITING

```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## 📁 FILE UPLOAD

```
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

---

## 🔗 VARIABLES OPCIONALES (Comentadas - Agregar si las necesitas)

### 📧 EMAIL (SMTP)
```
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# EMAIL_FROM=your-email@gmail.com
```

### 💳 STRIPE (Pagos)
```
# STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
# STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 🗃️ REDIS (Cache)
```
# REDIS_URL=redis://your-redis-host:6379
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

### 🏗️ SUPABASE (Adicional)
```
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_KEY=your-service-key
```

---

## 🔥 CONFIGURACIÓN RENDER DASHBOARD

1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Environment**: Node.js
4. **Node Version**: 20 o superior (se detecta automáticamente)

---

## ⚠️ IMPORTANTE

1. **JWT_SECRET** y **COOKIE_SECRET**: ¡DEBEN ser cambiados por valores seguros de mínimo 32 caracteres!
2. **DATABASE_URL**: Usar tu URL real de Supabase
3. **CORS**: Actualizar con tus dominios reales de producción
4. **HOST**: DEBE ser `0.0.0.0` para que Render pueda acceder
5. **PORT**: DEBE ser `10000` (puerto por defecto de Render)

---

## 🧪 TESTING

Una vez desplegado, puedes probar:

- **Health**: `https://tu-app.onrender.com/health`
- **Admin Auth**: `https://tu-app.onrender.com/admin/auth/token`

```bash
# Ejemplo de test con curl
curl -X POST https://tu-app.onrender.com/admin/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```
