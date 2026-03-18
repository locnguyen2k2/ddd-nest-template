# 📁 RBAC NestJS

**A comprehensive Role-Based Access Control (RBAC) system built with NestJS framework implementing Identity and Access Management (IAM) functionality**

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/locnguyen2k2/rbac-nestjs.git
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

RBAC NestJS is a robust Identity and Access Management (IAM) system that provides comprehensive role-based access control capabilities. Built with NestJS framework following Domain-Driven Design (DDD) principles, it offers a scalable and maintainable solution for managing users, roles, permissions, and organizations.

**Business Value**: Provides enterprise-grade access control with granular permissions, multi-tenant support through organizations, and real-time capabilities.

**Target Audience**: Enterprise applications, SaaS platforms, and systems requiring sophisticated access control mechanisms.

## ✨ Features

- **🔐 Role-Based Access Control**: Complete RBAC implementation with roles, permissions, and features
- **👥 Multi-Tenant Support**: Organization-based isolation and management
- **🎯 Granular Permissions**: Feature-level permission control with role assignments
- **🔄 Real-Time Updates**: Event-driven architecture with real-time notifications via Ably
- **📊 Caching Layer**: Redis-based caching for improved performance
- **📚 API Documentation**: Comprehensive OpenAPI/Swagger documentation
- **🛡️ Security**: Built-in authentication and authorization mechanisms
- **📈 Scalability**: DDD architecture supporting horizontal scaling

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | ^11.0.1 | Backend framework |
| TypeScript | ^5.7.3 | Type-safe JavaScript |
| Prisma | ^7.5.0 | Database ORM |
| PostgreSQL | - | Primary database |
| Redis | - | Caching and session storage |
| Jest | ^29.7.0 | Testing framework |
| Swagger | ^11.2.6 | API documentation |
| Fastify | ^11.1.16 | HTTP server |
| Ably | ^2.20.0 | Real-time messaging |

## 📦 Prerequisites

- **Node.js**: 18.0.0 or later
- **npm/yarn/pnpm**: 9.0.0 or later
- **PostgreSQL**: 13.0 or later
- **Redis**: 6.0 or later
- **Other**: Git for version control

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/locnguyen2k2/rbac-nestjs.git
cd rbac-nestjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.development

# Edit environment variables
# Configure database URL, Redis connection, and other settings
```

### 4. Database Setup

```bash
# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 5. Start the Application

```bash
npm run start:dev
```

## 🎯 Usage

### Basic Usage

```bash
# Start development server
npm run start:dev

# Access API documentation
# Open http://localhost:3004/apis in your browser

# Health check
curl http://localhost:3004/health
```

### Advanced Usage

```bash
# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Run with coverage
npm run test:cov
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| APP_PORT | number | 3004 | Application port |
| NODE_ENV | string | development | Environment mode |
| SWAGGER_ENABLE | boolean | true | Enable Swagger docs |
| THROTTLE_DEFAULT_LIMIT | number | 10 | Rate limit per window |
| REDIS_URL | string | - | Redis connection string |

## 📚 API Documentation

**API Documentation**: [http://localhost:3004/apis](http://localhost:3004/apis)

### Main Endpoints

- `POST /roles`: Create a new role
- `GET /roles`: List all roles
- `GET /roles/:id`: Get role by ID
- `PATCH /roles/:id`: Update role
- `DELETE /roles/:id`: Delete role
- `POST /organizations`: Create organization
- `GET /organizations`: List organizations
- `POST /features`: Create feature
- `GET /features`: List features

### Authentication

Currently uses Basic Authentication (configurable for JWT implementation). Authentication headers can be configured in the environment variables.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](docs/contributing/overview.md) for details.

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/locnguyen2k2/rbac-nestjs.git
cd rbac-nestjs

# Install dependencies
npm install

# Run tests
npm run test

# Start development server
npm run start:dev
```

### Code Style

- Use ESLint with Prettier for code formatting
- Follow conventional commit messages
- Write tests for new features
- Update documentation

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suite
npm run test:e2e

# Run with coverage
npm run test:cov
```

## 📦 Deployment

### Development

```bash
npm run start:dev
```

### Production

```bash
# Build application
npm run build

# Start production server
npm run start:prod
```

### Docker

```bash
# Build Docker image
docker build -t rbac-nestjs .

# Run container
docker run -p 3004:3004 rbac-nestjs
```

## 📊 Project Structure

```
rbac-nestjs/
├── src/                    # Source code
│   ├── modules/           # Feature modules
│   │   ├── iam/           # IAM module
│   │   ├── notification/  # Notification module
│   │   └── social/        # Social module
│   ├── shared/            # Shared infrastructure
│   ├── config/            # Configuration files
│   └── common/            # Common utilities
├── test/                  # Test files
├── prisma/                # Database schema and migrations
│   └── pg-rbac/          # PostgreSQL RBAC schema
├── docs/                  # Documentation
└── scripts/               # Build and deployment scripts
```

## 🔍 Monitoring & Logging

The application includes comprehensive logging and monitoring capabilities. Log levels can be configured through environment variables. Redis integration provides caching and session management.

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change APP_PORT in .env or kill process on port 3004 |
| Database connection failed | Check PG_RBAC_DATABASE_URL and ensure PostgreSQL is running |
| Redis connection failed | Verify REDIS_URL and ensure Redis is accessible |
| Migration fails | Ensure database exists and user has proper permissions |

### Getting Help

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/locnguyen2k2/rbac-nestjs/issues)
- 💬 [Discussions](https://github.com/locnguyen2k2/rbac-nestjs/discussions)

## 📈 Performance

The application implements several performance optimization strategies:
- Redis caching for frequently accessed data
- Database connection pooling via Prisma
- Efficient query patterns with proper indexing
- Rate limiting to prevent abuse

## 🔒 Security

Security measures include:
- Role-based access control
- Input validation with class-validator
- SQL injection prevention via Prisma ORM
- Rate limiting and throttling
- Environment variable protection

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📄 License

This project is licensed under the UNLICENSED - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- **Your Name** - *Initial work* - [locnguyen2k2](https://github.com/locnguyen2k2)

## 🙏 Acknowledgments

- NestJS framework for the robust backend foundation
- Prisma team for the excellent ORM
- Redis for high-performance caching
- OpenAPI/Swagger for API documentation standards

---

**RBAC NestJS** - Enterprise-grade access control made simple

Built with ❤️ by [locnguyen2k2](https://github.com/locnguyen2k2)
