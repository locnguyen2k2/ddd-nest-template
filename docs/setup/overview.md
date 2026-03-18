# 🔧 Setup Guide

## 📋 Overview

This guide will help you set up **RBAC NestJS** on your local machine for development and testing purposes. Follow these steps to get the application running with all dependencies properly configured.

## 🎯 Business Requirements

| | |
|---|---|
| **Problem** | Developers need a consistent, reproducible environment setup process |
| **Goal** | Enable quick onboarding with minimal configuration friction |
| **Audience** | Developers joining the project, DevOps engineers, system administrators |
| **Success Metric** | <30 minutes from clone to running application |

## 📦 Prerequisites

### System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Operating System | Windows 10, macOS 10.15, Ubuntu 18.04 | Latest OS versions |
| RAM | 4GB | 8GB or more |
| Storage | 2GB free space | 5GB free space |
| Processor | 2 cores | 4 cores or more |

### Software Requirements

#### Required Software

- **Node.js**: 18.0.0 or later
  - Download: [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`
  - Recommended: Use LTS version

- **npm**: 9.0.0 or later (included with Node.js)
  - Alternative: yarn 1.22.0+ or pnpm 8.0.0+
  - Verify: `npm --version`

- **Git**: 2.30.0 or later
  - Download: [git-scm.com](https://git-scm.com/)
  - Verify: `git --version`

#### Database Requirements

- **PostgreSQL**: 13.0 or later
  - Download: [postgresql.org](https://postgresql.org/download/)
  - Verify: `psql --version`
  - Required for primary data storage

- **Redis**: 6.0 or later
  - Download: [redis.io](https://redis.io/download)
  - Verify: `redis-cli --version`
  - Required for caching and session management

#### Optional Software

- **Docker**: 20.10.0 or later (for containerized setup)
- **Docker Compose**: 2.0.0 or later
- **IDE/Editor**: VS Code, WebStorm, or similar
- **API Client**: Postman, Insomnia, or similar for API testing

## 🚀 Quick Start (5 minutes)

If you have all prerequisites installed:

```bash
# 1. Clone the repository
git clone https://github.com/locnguyen2k2/rbac-nestjs.git
cd rbac-nestjs

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.development
# Edit .env.development with your configuration

# 4. Initialize database
npx prisma migrate dev

# 5. Start the application
npm run start:dev

# 6. Verify installation
curl http://localhost:3004/health
```

## 📥 Installation

### Step 1: Clone the Repository

```bash
# Clone the project
git clone https://github.com/locnguyen2k2/rbac-nestjs.git
cd rbac-nestjs

# Verify the repository
ls -la
```

Expected files and directories:
- `src/` - Source code
- `prisma/` - Database schema
- `package.json` - Dependencies
- `.env.example` - Environment template
- `README.md` - Project documentation

### Step 2: Install Dependencies

#### Using npm

```bash
# Install dependencies
npm install

# Verify installation
npm list --depth=0

# Expected key dependencies:
# @nestjs/core, @nestjs/common, prisma, @prisma/client, etc.
```

#### Using yarn (alternative)

```bash
# Install dependencies
yarn install

# Verify installation
yarn list --depth=0
```

#### Using pnpm (alternative)

```bash
# Install dependencies
pnpm install

# Verify installation
pnpm list --depth=0
```

### Step 3: Environment Configuration

```bash
# Copy environment template
cp .env.example .env.development
```

Edit `.env.development` file with your configuration:

```bash
# Application Configuration
NODE_ENV=development
APP_PORT=3004
APP_HOST=localhost

# Database Configuration
PG_RBAC_DATABASE_URL=postgres://username:password@localhost:5432/rbac_db
# Replace with your actual PostgreSQL connection string

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=your_redis_username
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
REDIS_URL=redis://localhost:6379

# Authentication
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=admin

# Throttling Configuration
THROTTLE_DEFAULT_LIMIT=10
THROTTLE_DEFAULT_TTL=20

# Swagger/API Documentation
SWAGGER_ENABLE=true
SWAGGER_PATH=apis
SWAGGER_SERVER_URL=
APP_BASE_URL=http://localhost:3004

# Real-time Services
ABLY_KEY=your_ably_api_key

# Optional: External Services
# EXTERNAL_API_URL=https://api.example.com
# EXTERNAL_API_KEY=your_external_api_key
```

### Step 4: Database Setup

#### PostgreSQL Setup

**macOS (using Homebrew):**

```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb rbac_db

# Create user (optional but recommended)
psql postgres
CREATE USER rbac_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rbac_db TO rbac_user;
\q
```

**Ubuntu:**

```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE rbac_db;
CREATE USER rbac_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rbac_db TO rbac_user;
\q
```

**Windows:**

1. Download PostgreSQL installer from [postgresql.org](https://postgresql.org/download/windows/)
2. Run installer with default settings
3. Use pgAdmin to create database and user
4. Update connection string in `.env.development`

#### Redis Setup

**macOS (using Homebrew):**

```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

**Ubuntu:**

```bash
# Install Redis
sudo apt-get update
sudo apt-get install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping
```

**Windows:**

1. Download Redis for Windows from [Microsoft Archive](https://github.com/microsoftarchive/redis/releases)
2. Extract and run `redis-server.exe`
3. Or use WSL with Ubuntu for better compatibility

### Step 5: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Verify database setup
npx prisma db pull
npx prisma studio
# Opens Prisma Studio in browser to verify schema
```

Expected tables after migration:
- `users`
- `roles`
- `permissions`
- `organizations`
- `features`
- `user_roles`
- `role_feature_permissions`
- `user_organizations`
- `organization_roles`

### Step 6: Start the Application

#### Development Mode

```bash
# Start development server with hot reload
npm run start:dev

# Application will be available at
# http://localhost:3004
# API documentation at http://localhost:3004/apis
```

#### Production Mode (local testing)

```bash
# Build for production
npm run build

# Start production server
npm run start:prod

# Application will be available at
# http://localhost:3004
```

## ✅ Verification

### Health Check

```bash
# Check application health
curl http://localhost:3004/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "0.0.1"
}
```

### Database Connection

```bash
# Test database connection with Prisma
npx prisma db pull

# Expected: Schema pulled successfully
# Or use Prisma Studio
npx prisma studio
# Verify all tables exist
```

### API Endpoints

```bash
# Test main API endpoint (with authentication)
curl -u "admin:admin" http://localhost:3004/api/roles

# Expected response (empty array for new installation)
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "pages": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### API Documentation Access

Open your browser and navigate to:
- **Swagger UI**: http://localhost:3004/apis
- **Health Check**: http://localhost:3004/health

## 🐳 Docker Setup (Optional)

### Using Docker Compose

Create `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=development
      - PG_RBAC_DATABASE_URL=postgres://rbac_user:password@db:5432/rbac_db
      - REDIS_URL=redis://redis:6379
      - BASIC_AUTH_USERNAME=admin
      - BASIC_AUTH_PASSWORD=admin
    depends_on:
      - db
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=rbac_db
      - POSTGRES_USER=rbac_user
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Dockerfile (if not present)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3004

CMD ["npm", "run", "start:prod"]
```

## 🔧 Development Tools

### Code Quality

```bash
# Run linting
npm run lint

# Run formatting
npm run format

# Run type checking
npx tsc --noEmit
```

### Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run specific test file
npm run test -- -- test/user.service.spec.ts

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

### Development Scripts

```bash
# Available npm scripts
npm run

# Common scripts
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linting
npm run format       # Format code
npm run migrate:dev  # Run Prisma migrations
npm run db:seed      # Seed database (if implemented)
npm run db:studio    # Open Prisma Studio
```

## 🚨 Troubleshooting

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Port already in use | Error: listen EADDRINUSE :::3004 | Change APP_PORT in .env or kill process: `lsof -ti:3004 | xargs kill` |
| Database connection failed | Connection refused or timeout | Check PG_RBAC_DATABASE_URL, ensure PostgreSQL is running, verify credentials |
| Redis connection failed | Redis connection error | Verify REDIS_URL, ensure Redis is running, check firewall settings |
| Permission denied | EACCES error during installation | Run with appropriate permissions or use Node Version Manager (nvm) |
| Module not found | Cannot find module error | Run `npm install` again, check node_modules exists |
| Environment variables missing | undefined variables | Verify .env.development exists and is properly formatted |
| Migration fails | SQL errors or permission issues | Check database exists, user has proper permissions, connection string is correct |
| Prisma client not generated | PrismaClient related errors | Run `npx prisma generate` after schema changes |

### Debug Mode

```bash
# Run with debug logging
DEBUG=* npm run start:dev

# Enable verbose output
npm run start:dev -- --verbose

# Check environment variables
npm run start:dev -- --inspect
```

### Log Files

Application logs are output to console. In production, configure logging to files:

- **Application logs**: Console output (configure file logging as needed)
- **Database logs**: PostgreSQL logs (check PostgreSQL configuration)
- **Redis logs**: Redis server logs

### Getting Help

- 📖 [Documentation](../README.md)
- 🐛 [Issue Tracker](https://github.com/locnguyen2k2/rbac-nestjs/issues)
- 💬 [Discussions](https://github.com/locnguyen2k2/rbac-nestjs/discussions)
- 📧 [Support Email](support@your-domain.com)

## 🔄 Next Steps

After successful setup:

1. **Explore the codebase**: Read through the source code in `src/`
2. **Run tests**: Ensure all tests pass with `npm run test`
3. **Make changes**: Start developing your features
4. **Read documentation**: Check out the full documentation in `docs/`
5. **Join community**: Connect with other developers in discussions

## 📚 Additional Resources

- [Architecture Documentation](../architecture/overview.md)
- [API Documentation](../api/overview.md)
- [Contributing Guidelines](../contributing/overview.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)

---

## ✅ Checklist

- [ ] System requirements met (Node.js 18+, PostgreSQL 13+, Redis 6+)
- [ ] Required software installed (Node.js, Git, PostgreSQL, Redis)
- [ ] Repository cloned successfully
- [ ] Dependencies installed without errors
- [ ] Environment variables configured in `.env.development`
- [ ] PostgreSQL database created and accessible
- [ ] Redis server running and accessible
- [ ] Database migrations executed successfully
- [ ] Application starts without errors
- [ ] Health check endpoint responds correctly
- [ ] API documentation accessible at `/apis`
- [ ] Basic API endpoints respond with authentication

---

*Last updated: March 18, 2026*
