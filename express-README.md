# Express.js E-commerce API

**Migrated from Medusa.js to Express.js**

This is a complete e-commerce API built with Express.js, TypeScript, and PostgreSQL. It's a migration from the original Medusa.js project while maintaining all core functionalities.

## 🚀 Features

- **Complete E-commerce API**: Products, variants, categories, inventory, pricing
- **Admin Panel Support**: Full admin API for management
- **Store API**: Customer-facing API for shopping
- **Authentication & Authorization**: JWT-based authentication
- **Multiple Currencies**: EUR, USD support
- **Inventory Management**: Stock locations and levels
- **Image Management**: Product images support
- **Search & Filtering**: Product search capabilities
- **Rate Limiting**: Built-in rate limiting for security
- **Comprehensive Logging**: Winston-based logging
- **Database Migrations**: Drizzle ORM with migrations
- **Testing**: Jest test suite
- **Health Checks**: Built-in health monitoring

## 🏗️ Architecture

- **Framework**: Express.js v4.18.2 (Latest)
- **Language**: TypeScript 5.3.2
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis (optional)
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Logging**: Winston
- **Rate Limiting**: rate-limiter-flexible
- **File Processing**: Sharp for images

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database and other configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/express_ecommerce
   JWT_SECRET=your-super-secret-jwt-key-here
   COOKIE_SECRET=your-super-secret-cookie-key-here
   STORE_CORS=http://localhost:3000
   ADMIN_CORS=http://localhost:3001
   # ... other variables
   ```

3. **Generate and run database migrations:**
   ```bash
   # Generate migrations from schema
   npx drizzle-kit generate:pg
   
   # Run migrations
   npm run migrate
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

## 🚦 Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
npm run test:watch
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health information
- `GET /health/db` - Database health check
- `GET /health/redis` - Redis health check

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/verify` - Token verification
- `POST /auth/refresh` - Token refresh

### Admin API (`/admin`)
- `GET /admin/products` - List all products
- `POST /admin/products` - Create product
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Delete product
- `GET /admin/orders` - List all orders
- `GET /admin/customers` - List all customers
- `GET /admin/analytics` - Store analytics

### Store API (`/store`)
- `GET /store/products` - List products for customers
- `GET /store/products/:id` - Get product details
- `GET /store/categories` - List categories
- `GET /store/cart` - Get customer cart
- `POST /store/cart/items` - Add to cart
- `POST /store/checkout` - Checkout process
- `GET /store/orders` - Customer order history

## 🗄️ Database Schema

The database schema includes all necessary tables for a complete e-commerce solution:

- **Products & Variants**: Product catalog with variants, options, and pricing
- **Categories**: Product categorization
- **Inventory**: Stock management with locations and levels
- **Orders & Cart**: Shopping cart and order management
- **Users**: Customer and admin user management
- **Regions**: Multi-region support with currencies
- **Shipping**: Shipping options and profiles
- **API Keys**: Publishable and secret key management

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `9000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `COOKIE_SECRET` | Cookie signing secret | Required |
| `REDIS_URL` | Redis connection string | Optional |
| `STORE_CORS` | Store frontend CORS | Required |
| `ADMIN_CORS` | Admin panel CORS | Required |

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 login attempts per 15 minutes
- **Password Reset**: 3 attempts per hour

## 📊 Monitoring & Logging

- **Health Checks**: `/health/*` endpoints for monitoring
- **Structured Logging**: Winston with multiple transports
- **Error Tracking**: Comprehensive error handling
- **Performance Metrics**: Request timing and database stats

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 9000
CMD ["npm", "start"]
```

### Environment Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run migrate`
4. Seed data: `npm run seed`
5. Start application: `npm start`

## 📈 Performance

- **Connection Pooling**: PostgreSQL connection pool (max 20 connections)
- **Caching**: Redis caching for sessions and frequently accessed data
- **Compression**: Gzip compression enabled
- **Rate Limiting**: Protection against abuse

## 🔐 Security

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Multiple rate limiting strategies
- **Input Validation**: Joi validation on all inputs
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds

## 🤝 Migration from Medusa.js

This project maintains the same core functionality as the original Medusa.js implementation:

- ✅ All product management features
- ✅ Complete inventory system
- ✅ Multi-currency support
- ✅ Admin and store APIs
- ✅ Authentication system
- ✅ Seed data compatibility
- ✅ Same API structure where possible

### Key Differences

- **Framework**: Express.js instead of Medusa framework
- **ORM**: Drizzle instead of MikroORM
- **Architecture**: Traditional Express middleware instead of Medusa modules
- **Database**: Direct PostgreSQL connection instead of Medusa abstractions

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Medusa.js team for the inspiration and data structure
- Express.js community for the excellent framework
- All the open-source contributors who made this possible
