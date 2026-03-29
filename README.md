# 🔐 RBAC NestJS

**A comprehensive Role-Based Access Control (RBAC) system built with NestJS, TypeScript, and PostgreSQL.**

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/locnguyen2k2/ddd-nest-template
cd rbac-nestjs

# Install dependencies
npm install

# Run the project
npm run start:dev
```

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 📖 About

RBAC NestJS is a robust, enterprise-ready authentication and authorization system that provides fine-grained access control for modern web applications. Built using Domain-Driven Design (DDD) principles, it offers a scalable and maintainable solution for managing user permissions across organizations, projects, and features.

**Business Value**: 
- Reduces development time by providing a ready-to-use RBAC system
- Ensures security through comprehensive permission management
- Scales from small teams to enterprise organizations
- Provides audit trails and compliance features

**Target Audience**: 
- Enterprise development teams building multi-tenant applications
- SaaS companies requiring sophisticated user management
- Organizations needing granular access control
- Developers implementing security-first architectures

## ✨ Features

- **Multi-Tenancy**: Support for multiple organizations with isolated data
- **Hierarchical Roles**: Create role hierarchies with inheritance
- **Feature-Based Permissions**: Granular permissions tied to specific features
- **Project-Level Access**: Control access at the project level within organizations
- **User Management**: Comprehensive user profile and status management
- **Audit Trail**: Track who created/modified what and when
- **RESTful API**: Clean, well-documented REST endpoints
- **TypeScript Support**: Full type safety and IntelliSense support
- **Database Migrations**: Schema versioning with Prisma
- **Caching**: Redis-based caching for performance optimization
- **Real-time Updates**: Ably integration for real-time notifications

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | ^11.0.1 | Progressive Node.js framework |
| TypeScript | ^5.7.3 | Type-safe JavaScript superset |
| Prisma | ^7.5.0 | Modern database toolkit |
| PostgreSQL | Latest | Relational database |
| Redis | Latest | In-memory data store for caching |
| Fastify | ^11.1.16 | High-performance HTTP server |
| Ably | ^2.20.0 | Real-time communication platform |
| bcrypt | ^6.0.0 | Password hashing |
| class-validator | ^0.15.1 | Input validation |
| Jest | ^29.7.0 | Testing framework |

## 📦 Prerequisites

- **Node.js**: 18.0.0 or later
- **npm**: 9.0.0 or later
- **PostgreSQL**: 13.0 or later
- **Redis**: 6.0 or later (for caching)
- **Git**: Latest version

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/locnguyen2k2/ddd-nest-template
cd rbac-nestjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
# Configure database connection, Redis, and Ably keys
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

### 5. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 🎯 Usage

### Basic Usage

The application provides RESTful endpoints for managing users, organizations, projects, roles, and permissions. Here's a quick example:

```bash
# Create a new organization
curl -X POST http://localhost:3000/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "slug": "acme-corp"}'

# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "username": "user123", "password": "securePassword"}'
```

### Advanced Usage

The system supports complex permission scenarios:

```bash
# Create a role with specific permissions
curl -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "slug": "admin", "organization_id": "org-id"}'

# Assign permissions to roles
curl -X POST http://localhost:3000/role-feature-permissions \
  -H "Content-Type: application/json" \
  -d '{"role_id": "role-id", "feature_id": "feature-id", "permission_id": "permission-id"}'
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| PORT | number | 3000 | Server port |
| NODE_ENV | string | development | Environment mode |
| DATABASE_URL | string | - | PostgreSQL connection string |
| REDIS_URL | string | - | Redis connection string |
| ABLY_API_KEY | string | - | Ably real-time API key |

## 📚 API Documentation

[API Documentation](docs/api/overview.md)

### Main Endpoints

- `POST /users`: Create new users
- `POST /organizations`: Create organizations
- `POST /projects`: Create projects within organizations
- `POST /roles`: Create roles with permissions
- `POST /features`: Define application features
- `GET /users/:id/permissions`: Get user permissions

### Authentication

The system uses JWT-based authentication with refresh tokens. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](docs/contributing/overview.md) for details.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/rbac-nestjs
cd rbac-nestjs

# Install dependencies
npm install

# Run tests
npm run test

# Start development server
npm run start:dev
```

### Code Style

- Use ESLint and Prettier for code formatting
- Follow Conventional Commits specification
- Write tests for new features
- Update documentation

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suite
npm run test:watch

# Run with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📦 Deployment

### Development

Use Docker Compose for local development:

```bash
docker-compose up -d
```

### Production

Deploy using PM2 or your preferred process manager:

```bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
```

### Docker

```bash
# Build Docker image
docker build -t rbac-nestjs .

# Run container
docker run -p 3000:3000 --env-file .env rbac-nestjs
```

## 📊 Project Structure

```
rbac-nestjs/
├── src/                    # Source code
│   ├── common/            # Common utilities and constants
│   ├── config/            # Configuration files
│   ├── modules/           # Feature modules
│   │   ├── iam/           # Identity and Access Management
│   │   ├── notification/  # Notification services
│   │   └── social/        # Social features
│   ├── shared/            # Shared application code
│   └── app.module.ts      # Root module
├── prisma/                # Database schema and migrations
├── test/                  # Test files
├── docs/                  # Documentation
└── scripts/               # Build and deployment scripts
```

## 🔍 Monitoring & Logging

The application includes comprehensive logging and monitoring capabilities:

- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Performance Metrics**: Request timing and database query monitoring
- **Health Checks**: Built-in health check endpoints
- **Error Tracking**: Centralized error reporting

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Database connection failed | Check DATABASE_URL in .env file |
| Redis connection refused | Ensure Redis is running and accessible |
| Permission denied errors | Verify user roles and permissions |
| Migration failures | Check database schema and migration files |

### Getting Help

- 📖 [Documentation](docs/README.md)
- 🐛 [Issue Tracker](https://github.com/locnguyen2k2/ddd-nest-template/issues)
- 💬 [Discussions](https://github.com/locnguyen2k2/ddd-nest-template/discussions)

## 📈 Performance

The application is optimized for high-performance scenarios:

- **Database Indexing**: Optimized queries with proper indexing
- **Caching Strategy**: Redis-based caching for frequently accessed data
- **Connection Pooling**: Efficient database connection management
- **Lazy Loading**: On-demand loading of related entities

## 🔒 Security

Security is a top priority with comprehensive measures:

- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **CORS Configuration**: Configurable cross-origin resource sharing

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📄 License

This project is licensed under the UNLICENSED - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- **locnguyen2k2** - *Initial work* - [locnguyen2k2](https://github.com/locnguyen2k2)

## 🙏 Acknowledgments

- NestJS Team for the excellent framework
- Prisma Team for the modern database toolkit
- Open Source Community for inspiration and contributions

---

**RBAC NestJS** - Enterprise-grade access control made simple

Built with ❤️ by [locnguyen2k2](https://github.com/locnguyen2k2)
