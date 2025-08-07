import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    // Configuración adicional para producción
    redisUrl: process.env.REDIS_URL, // Opcional
  },
  // Módulos adicionales para un e-commerce completo
  modules: {
    // Configuración de archivos para Render.com (opcional)
    // fileService: {
    //   resolve: "@medusajs/file-local",
    //   options: {
    //     upload_dir: process.env.NODE_ENV === 'production' ? '/data/uploads' : 'uploads',
    //   },
    // },
  },
})
