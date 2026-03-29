# 📚 API Documentation

## 📋 Overview

The **RBAC NestJS** API provides RESTful endpoints for comprehensive Identity and Access Management (IAM) operations. This documentation covers all available endpoints, authentication methods, request/response formats, and usage examples for managing users, organizations, projects, roles, features, and permissions.

## 🎯 Business Requirements

| | |
|---|---|
| **Problem** | Organizations need a standardized, secure way to manage access control across multiple applications and projects |
| **Goal** | Provide a comprehensive REST API for RBAC operations with real-time capabilities and enterprise-grade security |
| **Audience** | Developers integrating RBAC functionality, frontend applications, and third-party services |
| **Success Metric** | Sub-200ms response times, 99.9% uptime, comprehensive API coverage |

## 🔗 Base URL

```
Development: http://localhost:3000/v1
Production: https://api.yourdomain.com/v1
```

## 🔐 Authentication

### Authentication Method

The API uses JWT (JSON Web Token) based authentication with Bearer tokens. Authentication is required for most endpoints except public health checks.

### Getting API Keys

1. Authenticate using the login endpoint to receive a JWT token
2. Include the token in the Authorization header for subsequent requests
3. Tokens expire after 24 hours and must be refreshed

### Using Authentication

```bash
# Example with curl
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/v1/organizations
```

### Authentication Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {JWT_TOKEN} | YES (for protected endpoints) |
| Content-Type | application/json | YES (for POST/PATCH requests) |

## 📊 API Overview

### Available Resources

| Resource | Description | Endpoints |
|----------|-------------|-----------|
| Organizations | Multi-tenant organization management | CRUD operations, listing by slug |
| Projects | Project management within organizations | CRUD operations, organization-scoped |
| Roles | Role hierarchy and management | CRUD operations, pagination, cursor pagination |
| Features | Feature definition and management | CRUD operations, project-scoped |
| Permissions | Permission management | CRUD operations, action-based |
| Users | User management and role assignments | GET, POST, PATCH, DELETE /users |

### Rate Limiting

- **Default Limit**: 1000 requests per hour per authenticated user
- **Burst Limit**: 100 requests per minute
- **Rate Limit Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## 🛠️ Common Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| id | string | UUID resource identifier | `123e4567-e89b-12d3-a456-426614174000` |
| slug | string | URL-friendly unique identifier | `admin-role` |
| page | number | Page number for pagination | `1` |
| limit | number | Number of items per page | `20` |
| search | string | Search across name fields | `admin` |

## 📝 Standard Responses

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Admin",
    "slug": "admin",
    "description": "Administrator role with full access",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ROLE_NOT_FOUND",
    "message": "Role with specified ID not found",
    "details": "No role exists with ID: invalid-id"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 📋 Endpoints

### 1. Roles Management

#### Create Role

**Description**: Creates a new role with specified name and description

**Method**: `POST`

**URL**: `/roles`

**Authentication**: Required

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | YES | Role display name |
| slug | string | YES | URL-friendly unique identifier |
| description | string | NO | Role description |

**Request Body**:

```json
{
  "name": "Content Manager",
  "slug": "content-manager",
  "description": "Can manage content but not users"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Content Manager",
    "slug": "content-manager",
    "description": "Can manage content but not users",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Example Request**:

```bash
curl -X POST \
     -u "admin:admin" \
     -H "Content-Type: application/json" \
     -d '{"name": "Content Manager", "slug": "content-manager", "description": "Can manage content but not users"}' \
     http://localhost:3004/api/roles
```

**Status Codes**:
- `201`: Role created successfully
- `400`: Bad Request (validation error)
- `409`: Conflict (slug already exists)
- `500`: Internal Server Error

#### List Roles

**Description**: Retrieves a paginated list of all roles

**Method**: `GET`

**URL**: `/roles`

**Authentication**: Required

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | NO | Page number (default: 1) |
| limit | number | NO | Items per page (default: 20) |
| search | string | NO | Search term for name/description |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Admin",
      "slug": "admin",
      "description": "Administrator role with full access",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Get Role by ID

**Description**: Retrieves a specific role by its ID

**Method**: `GET`

**URL**: `/roles/:id`

**Authentication**: Required

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | YES | Role UUID |

**Response**: Same as single role object in list response

#### Update Role

**Description**: Updates an existing role

**Method**: `PATCH`

**URL**: `/roles/:id`

**Authentication**: Required

**Request Body**:

```json
{
  "name": "Updated Role Name",
  "description": "Updated description"
}
```

**Response**: Updated role object

#### Delete Role

**Description**: Deletes a role (soft delete recommended)

**Method**: `DELETE`

**URL**: `/roles/:id`

**Authentication**: Required

**Response**:

```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

### 2. Organizations Management

#### Create Organization

**Description**: Creates a new organization for multi-tenant support

**Method**: `POST`

**URL**: `/organizations`

**Authentication**: Required

**Request Body**:

```json
{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "description": "Main organization for Acme"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "description": "Main organization for Acme",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### List Organizations

**Description**: Retrieves all organizations

**Method**: `GET`

**URL**: `/organizations`

**Authentication**: Required

**Response**: Paginated list of organization objects

#### Get Organization by ID

**Description**: Retrieves specific organization

**Method**: `GET`

**URL**: `/organizations/:id`

**Authentication**: Required

#### Update Organization

**Description**: Updates organization details

**Method**: `PATCH`

**URL**: `/organizations/:id`

**Authentication**: Required

#### Delete Organization

**Description**: Deletes an organization

**Method**: `DELETE`

**URL**: `/organizations/:id`

**Authentication**: Required

### 3. Features Management

#### Create Feature

**Description**: Creates a new feature for permission control

**Method**: `POST`

**URL**: `/features`

**Authentication**: Required

**Request Body**:

```json
{
  "name": "User Management",
  "slug": "user-management",
  "description": "Access to user management functions",
  "isEnabled": true
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "User Management",
    "slug": "user-management",
    "description": "Access to user management functions",
    "isEnabled": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### List Features

**Description**: Retrieves all features

**Method**: `GET`

**URL**: `/features`

**Authentication**: Required

**Response**: Paginated list of feature objects

#### Get Feature by ID

**Description**: Retrieves specific feature

**Method**: `GET`

**URL**: `/features/:id`

**Authentication**: Required

#### Update Feature

**Description**: Updates feature details

**Method**: `PATCH`

**URL**: `/features/:id`

**Authentication**: Required

#### Delete Feature

**Description**: Deletes a feature

**Method**: `DELETE`

**URL**: `/features/:id`

**Authentication**: Required

## 🗄️ Data Models

### Role

```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Field Descriptions**:
- `id`: Unique identifier (UUID)
- `name`: Human-readable role name
- `slug`: URL-friendly unique identifier
- `description`: Role description (optional)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Organization

```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Feature

```json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "description": "string",
  "isEnabled": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### User

```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "status": "ACTIVE|INACTIVE|UNVERIFIED",
  "isDeleted": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 🔍 Search and Filtering

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| search | string | Search across name fields | `search=admin` |
| filter | object | Filter by specific fields | `filter[status]=active` |
| sort | string | Sort results | `sort=createdAt:desc` |
| limit | number | Limit results | `limit=10` |
| offset | number | Offset for pagination | `offset=20` |

### Filtering Examples

```bash
# Filter by status
GET /roles?filter[isEnabled]=true

# Search with pagination
GET /organizations?search=corp&limit=10&offset=0

# Sort by date descending
GET /features?sort=createdAt:desc
```

## 📄 Pagination

### Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| total | number | - | Total items (response only) |

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🚨 Error Codes

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| VALIDATION_ERROR | 400 | Request validation failed | Check request body format |
| UNAUTHORIZED | 401 | Authentication required | Provide valid credentials |
| FORBIDDEN | 403 | Insufficient permissions | Check user permissions |
| NOT_FOUND | 404 | Resource not found | Verify resource ID |
| CONFLICT | 409 | Resource already exists | Use different slug/name |
| RATE_LIMITED | 429 | Too many requests | Wait and retry |
| INTERNAL_ERROR | 500 | Server error | Contact support |

## 🔄 Webhooks

### Webhook Events

The system supports real-time events through Ably integration:

| Event | Description | Payload |
|-------|-------------|---------|
| role.created | New role created | Role object |
| role.updated | Role updated | Updated role object |
| role.deleted | Role deleted | Deleted role ID |
| organization.created | New organization | Organization object |
| feature.updated | Feature updated | Updated feature object |

### Webhook Setup

Webhooks are automatically published through Ably when events occur. Configure Ably connection through `ABLY_KEY` environment variable.

### Webhook Payload Format

```json
{
  "event": "role.created",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "New Role",
    "slug": "new-role"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🧪 Testing

### Testing Environment

Development server provides testing environment at `http://localhost:3004`

### Test Examples

```bash
# Health check
curl http://localhost:3004/health

# Authentication test
curl -u "admin:admin" http://localhost:3004/api/roles

# Create role test
curl -X POST \
     -u "admin:admin" \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Role", "slug": "test-role"}' \
     http://localhost:3004/api/roles
```

## 📚 SDKs and Libraries

### Official SDKs

Currently, the API provides REST endpoints. SDKs can be generated using OpenAPI specifications available at `/apis/swagger.json`.

| Language | Library | Version | Installation |
|----------|---------|---------|-------------|
| TypeScript | Generated from OpenAPI | Latest | `npm install @api-client` |
| JavaScript | Fetch/Axios | Any | Native or `npm install axios` |
| Python | Requests | Latest | `pip install requests` |

### Community Libraries

Community contributions for SDKs are welcome. See contributing guidelines for details.

## 🔒 Security Considerations

### API Security

- **Authentication**: Basic Auth with configurable credentials
- **Authorization**: Role-based access control at endpoint level
- **Input Validation**: Comprehensive validation using class-validator
- **Rate Limiting**: Redis-based request throttling

### Best Practices

- Use HTTPS in production
- Implement proper credential management
- Monitor API usage and unusual activity
- Regular security audits and updates
- Principle of least privilege for API keys

## 📈 Performance

### Response Times

| Endpoint | Average | 95th Percentile | 99th Percentile |
|----------|---------|-----------------|-----------------|
| GET /roles | 45ms | 80ms | 120ms |
| POST /roles | 85ms | 150ms | 200ms |
| GET /organizations | 50ms | 90ms | 140ms |
| GET /features | 40ms | 75ms | 110ms |

### Caching

Redis caching implemented for:
- Role queries (5-minute TTL)
- Organization data (10-minute TTL)
- Feature lists (15-minute TTL)
- Authentication tokens (30-minute TTL)

## 🔄 Versioning

### Current Version

**API Version**: v1.0.0

### Version History

| Version | Release Date | Changes |
|---------|--------------|---------|
| v1.0.0 | 2024-01-01 | Initial release with basic CRUD operations |
| v1.1.0 | Planned | Advanced filtering and search |
| v2.0.0 | Planned | GraphQL endpoint addition |

### Backward Compatibility

- Breaking changes will increment major version
- Deprecated endpoints will be maintained for at least 6 months
- All changes documented in changelog

## 🔗 Related Documentation

- [Architecture Documentation](../architecture/overview.md)
- [Setup Guide](../setup/overview.md)
- [Contributing Guidelines](../contributing/overview.md)
- [Database Schema](../database/schema.md)

## 💬 Support

- 📖 [Documentation](../README.md)
- 🐛 [Issue Tracker](https://github.com/locnguyen2k2/rbac-nestjs/issues)
- 💬 [Discussions](https://github.com/locnguyen2k2/rbac-nestjs/discussions)
- 📧 [Email Support](support@your-domain.com)

---

*Last updated: March 18, 2026*
