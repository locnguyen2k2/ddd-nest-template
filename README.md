# 🛡️ ABAC NestJS - Advanced Authorization System

[![NestJS](https://img.shields.io/badge/framework-NestJS-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-blue.svg)](https://www.prisma.io/)
[![ABAC](https://img.shields.io/badge/Auth-ABAC-green.svg)](https://en.wikipedia.org/wiki/Attribute-based_access_control)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

**ABAC NestJS** is a production-grade, fine-grained, context-aware authorization system built with NestJS. It implements **Attribute-Based Access Control (ABAC)** using Domain-Driven Design (DDD) principles to provide a scalable and flexible solution for modern multi-tenant applications.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis
- MongoDB (optional, for specific features)

### 2. Setup
```bash
# Install dependencies
npm install

# Initialize environment
cp .env.example .env

# Generate Prisma clients
npm run prisma:generate

# Start development server
npm run start:dev
```

### 3. Usage
```typescript
@Get(':id')
@CheckAbac({ action: 'read', resource: 'project' })
async findOne(@Param('id') id: string) {
  return this.projectService.findOne(id);
}
```

---

## ✨ Features

- **Attribute-Based Access Control (ABAC)**: Dynamic policy evaluation based on subject, resource, and environment attributes.
- **Multi-Tenancy**: Built-in support for Organization and Project-level isolation.
- **Domain-Driven Design (DDD)**: Clean architecture with clear separation of domain, application, and infrastructure layers.
- **Policy Engine**: Powered by `json-logic-js` for complex, serializable rule definitions.
- **Real-time Events**: Integration with Ably and RabbitMQ for event-driven architecture.
- **Context-Aware**: Uses CLS (Context Local Storage) to manage tenant and user context across async calls.
- **High Performance**: Optimized with Fastify and Redis caching for sub-10ms authorization decisions.

---

## 🏗️ Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Framework** | [NestJS](https://nestjs.com/) | Robust DI, modularity, and TypeScript first. |
| **Runtime** | [Fastify](https://www.fastify.io/) | High-performance HTTP framework (2x faster than Express). |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe database access and schema management. |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Reliable relational data with excellent JSON support. |
| **Cache** | [Redis](https://redis.io/) | Ultra-fast storage for sessions and throttling. |
| **Policy Engine** | [json-logic-js](https://github.com/jwadhams/json-logic-js) | Serializable, cross-platform logic evaluation. |
| **Messaging** | [RabbitMQ](https://www.rabbitmq.com/) | Reliable asynchronous event processing. |
| **Real-time** | [Ably](https://ably.com/) | Scalable real-time communication. |

---

## 🔧 Installation

### Step-by-Step Guide

1. **Clone the Repository**
   ```bash
   git clone https://github.com/locnguyen2k2/ddd-nest-template.git
   cd rbac-nestjs
   ```

2. **Environment Configuration**
   Edit `.env` and set your database connection strings:
   ```env
   PG_RBAC_DATABASE_URL="postgresql://user:password@localhost:5432/rbac_db"
   REDIS_URL="redis://localhost:6379"
   ```

3. **Database Migration**
   ```bash
   npx prisma migrate dev --schema=prisma/pg-rbac/schema.prisma
   ```

4. **Seed Initial Data**
   ```bash
   npm run prisma:seed
   ```

5. **Start the Application**
   ```bash
   npm run build
   npm run start:prod
   ```

---

## 📖 Usage

### Defining Policies
Policies are defined using JSON Logic. Example of a policy that allows reading a project if the user is the creator:
```json
{
  "name": "Project Owner Read",
  "effect": "ALLOW",
  "action": "read",
  "resource": "project",
  "condition": { "==": [{ "var": "subject.id" }, { "var": "resource.created_by" }] }
}
```

### Applying Guards
Use the `@CheckAbac` decorator to protect your endpoints:
```typescript
@Controller('projects')
@UseGuards(JwtAuthGuard, TenantContextGuard, AbacGuard)
export class ProjectController {
  @Post()
  @CheckAbac({ action: 'create', resource: 'project' })
  async create(@Body() createDto: CreateProjectDto) {
    // ...
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Review our [Contributing Guidelines](./project-docs/contributing-guidelines.md).
2. Use [Conventional Commits](https://www.conventionalcommits.org/).
3. Ensure all tests pass before submitting a PR.

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for the full license text.

---

Built with ❤️ for secure and scalable applications.
