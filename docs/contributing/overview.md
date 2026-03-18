# 🤝 Contributing Guidelines

## 📋 Overview

Thank you for your interest in contributing to **RBAC NestJS**! This guide will help you get started with contributing to our comprehensive Role-Based Access Control system. We welcome contributions of all types, from bug fixes to new features and documentation improvements.

## 🎯 Business Requirements

| | |
|---|---|
| **Problem** | Need community involvement to improve and extend the RBAC system |
| **Goal** | Enable high-quality contributions while maintaining code quality and architectural integrity |
| **Audience** | Developers, DevOps engineers, technical writers, and security experts |
| **Success Metric** | Consistent, high-quality contributions that align with project goals |

## 🚀 Getting Started

### Prerequisites

Before you start contributing, make sure you have:

- ✅ Read the [Project README](../README.md)
- ✅ Set up your [development environment](../setup/overview.md)
- ✅ Familiarized yourself with the [codebase architecture](../architecture/overview.md)
- ✅ Created a GitHub account
- ✅ Reviewed the [API documentation](../api/overview.md)

### Step 1: Fork the Repository

1. Navigate to https://github.com/locnguyen2k2/rbac-nestjs
2. Click the "Fork" button in the top-right corner
3. Choose your GitHub account as the destination

### Step 2: Clone Your Fork

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/rbac-nestjs.git
cd rbac-nestjs

# Add original repository as upstream
git remote add upstream https://github.com/locnguyen2k2/rbac-nestjs.git

# Verify remotes
git remote -v
# Should show both origin (your fork) and upstream (original)
```

### Step 3: Set Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.development
# Edit .env.development with your configuration

# Run database setup
npx prisma migrate dev

# Start development server
npm run start:dev
```

## 📝 Contribution Types

We welcome the following types of contributions:

### 🐛 Bug Reports

Report bugs by creating an issue with:

- **Clear title**: Descriptive bug title (e.g., "Role creation fails with duplicate slug")
- **Environment**: OS, Node.js version, PostgreSQL version, Redis version
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable (for UI issues)
- **Additional context**: Any other relevant information

**Bug Report Template**:

```markdown
## Bug Description
Brief description of the bug

## Environment
- OS: [e.g., Ubuntu 20.04]
- Node.js: [e.g., 18.17.0]
- PostgreSQL: [e.g., 15.0]
- Redis: [e.g., 7.0]

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Additional Context
Any other context about the problem
```

### ✨ Feature Requests

Request new features by creating an issue with:

- **Clear title**: Descriptive feature title (e.g., "Add bulk role assignment")
- **Problem statement**: What problem this solves
- **Proposed solution**: How you envision the solution
- **Alternatives considered**: Other approaches you've thought about
- **Additional context**: Any other relevant information

**Feature Request Template**:

```markdown
## Feature Description
Brief description of the feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How do you envision this feature working?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Any other relevant information
```

### 🔧 Code Contributions

#### Types of Code Contributions

- **Bug fixes**: Fixes for existing issues
- **New features**: Implementation of new functionality
- **Documentation**: Improvements to documentation
- **Tests**: Addition or improvement of tests
- **Refactoring**: Code improvements without functional changes
- **Performance**: Optimizations and performance improvements

#### Code Contribution Process

1. **Check for existing issues**: Search for related issues or discussions
2. **Create an issue**: If none exists, create one to discuss your approach
3. **Create a branch**: Create a feature branch from `main`
4. **Write code**: Implement your changes following our coding standards
5. **Test thoroughly**: Ensure all tests pass and add new tests
6. **Document changes**: Update relevant documentation
7. **Submit pull request**: Create a PR with detailed description

## 🌿 Branching Strategy

### Branch Types

| Branch Type | Purpose | Naming Convention |
|-------------|---------|------------------|
| Feature | New features | `feature/feature-name` |
| Bugfix | Bug fixes | `bugfix/issue-description` |
| Hotfix | Critical fixes | `hotfix/urgent-fix` |
| Refactor | Code refactoring | `refactor/improvement-name` |
| Documentation | Documentation updates | `docs/update-description` |
| Release | Release preparation | `release/version-number` |

### Creating a Branch

```bash
# Ensure main is up to date
git checkout main
git pull upstream main

# Create and checkout new branch
git checkout -b feature/bulk-role-assignment

# Push branch to your fork
git push origin feature/bulk-role-assignment
```

## 📝 Coding Standards

### Code Style

We use the following tools and standards:

- **ESLint**: Linting with NestJS recommended configuration
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Strict type checking enabled
- **Husky**: Git hooks for pre-commit checks (if configured)

#### Code Formatting

```bash
# Format code
npm run format

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

#### Code Style Guidelines

- **Naming conventions**:
  - Use camelCase for variables and functions
  - Use PascalCase for classes, interfaces, and types
  - Use UPPER_SNAKE_CASE for constants
  - Use kebab-case for file names

- **Code structure**:
  - Keep functions small and focused (single responsibility)
  - Use meaningful variable and function names
  - Add JSDoc comments for complex logic
  - Follow DRY (Don't Repeat Yourself) principle

- **TypeScript specific**:
  - Use explicit types when possible
  - Prefer interfaces over types for object shapes
  - Use `any` type sparingly and with justification
  - Enable strict mode in tsconfig.json

### Code Examples

#### Good Example

```typescript
/**
 * Service for managing role operations in the RBAC system
 */
@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Creates a new role with validation
   * @param createRoleDto - Role creation data
   * @returns Created role entity
   * @throws ConflictException if role slug already exists
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role with slug already exists
    const existingRole = await this.roleRepository.findOne({
      where: { slug: createRoleDto.slug },
    });

    if (existingRole) {
      throw new ConflictException(`Role with slug '${createRoleDto.slug}' already exists`);
    }

    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  /**
   * Finds role by slug with error handling
   * @param slug - Role slug identifier
   * @returns Role entity or null
   */
  async findBySlug(slug: string): Promise<Role | null> {
    return await this.roleRepository.findOne({ where: { slug } });
  }
}
```

#### Bad Example

```typescript
// Bad: No types, unclear naming, no error handling
export class rs {
  constructor(repo) {
    this.repo = repo;
  }

  async create(data) {
    return this.repo.save(data);
  }

  async find(slug) {
    return this.repo.findOne({ where: { slug } });
  }
}
```

## 🧪 Testing

### Testing Requirements

- **Unit tests**: For all business logic and services
- **Integration tests**: For API endpoints and database operations
- **E2E tests**: For critical user flows
- **Coverage**: Maintain 80%+ test coverage
- **Test organization**: Follow NestJS testing patterns

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run specific test file
npm run test -- -- test/role.service.spec.ts

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

### Writing Tests

#### Unit Test Example

```typescript
describe('RoleService', () => {
  let service: RoleService;
  let repository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    repository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  describe('createRole', () => {
    it('should create a new role successfully', async () => {
      // Arrange
      const createRoleDto: CreateRoleDto = {
        name: 'Admin',
        slug: 'admin',
        description: 'Administrator role',
      };

      const expectedRole = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createRoleDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(expectedRole);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedRole);

      // Act
      const result = await service.createRole(createRoleDto);

      // Assert
      expect(result).toEqual(expectedRole);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'admin' },
      });
      expect(repository.create).toHaveBeenCalledWith(createRoleDto);
      expect(repository.save).toHaveBeenCalledWith(expectedRole);
    });

    it('should throw ConflictException when role slug already exists', async () => {
      // Arrange
      const createRoleDto: CreateRoleDto = {
        name: 'Admin',
        slug: 'admin',
        description: 'Administrator role',
      };

      const existingRole = { id: 'existing-id', slug: 'admin' };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingRole as Role);

      // Act & Assert
      await expect(service.createRole(createRoleDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'admin' },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
```

#### Integration Test Example

```typescript
describe('RoleController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  afterEach(async () => {
    await prisma.role.deleteMany();
    await app.close();
  });

  describe('/roles (POST)', () => {
    it('should create a new role', () => {
      const createRoleDto = {
        name: 'Test Role',
        slug: 'test-role',
        description: 'Test role description',
      };

      return request(app.getHttpServer())
        .post('/api/roles')
        .set('Authorization', 'Basic ' + Buffer.from('admin:admin').toString('base64'))
        .send(createRoleDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Test Role');
          expect(res.body.data.slug).toBe('test-role');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/roles')
        .send({ name: 'Test Role' })
        .expect(401);
    });
  });
});
```

## 📝 Documentation

### Documentation Requirements

- **README.md**: Keep it up to date with latest features
- **API docs**: Update for API changes (Swagger annotations)
- **Code comments**: Add JSDoc comments for complex logic
- **Changelog**: Update for version changes
- **Architecture docs**: Update for architectural changes

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots when helpful (for UI changes)
- Follow the project's documentation style
- Update relevant sections when making changes

## 📤 Pull Request Process

### Before Submitting

1. **Run tests**: Ensure all tests pass
   ```bash
   npm run test
   ```

2. **Run linting**: Fix any linting issues
   ```bash
   npm run lint
   ```

3. **Run formatting**: Ensure code is properly formatted
   ```bash
   npm run format
   ```

4. **Update documentation**: Update relevant docs
5. **Check requirements**: Ensure all requirements are met

### Pull Request Template

```markdown
## Description
Brief description of changes made in this PR

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Test coverage maintained or improved
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Documentation updated
- [ ] Changelog updated (if applicable)
- [ ] Breaking changes documented (if applicable)

## Additional Notes
Any additional context or notes about the changes
```

### Submitting Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create pull request**:
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template completely
   - Click "Create Pull Request"

3. **Review process**:
   - Automated checks will run (tests, linting, etc.)
   - Maintainers will review your code
   - Address feedback as needed
   - Once approved, your PR will be merged

## 🏆 Recognition

### Contributor Recognition

- **Contributors list**: Added to README.md
- **Release notes**: Mentioned in changelog
- **Community highlights**: Featured in community posts
- **Maintainer consideration**: Active contributors may be invited as maintainers

### Becoming a Maintainer

Active contributors may be invited to become maintainers. Criteria:

- **Consistent quality contributions**: Regular high-quality PRs
- **Understanding of codebase**: Deep knowledge of the system
- **Active community participation**: Helpful in discussions and reviews
- **Alignment with project goals**: Support for project vision and direction

## 📞 Getting Help

### Resources

- 📖 [Documentation](../README.md)
- 🐛 [Issue Tracker](https://github.com/locnguyen2k2/rbac-nestjs/issues)
- 💬 [Discussions](https://github.com/locnguyen2k2/rbac-nestjs/discussions)
- 📧 [Maintainer Email](maintainers@your-domain.com)

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions, ideas, and general discussion
- **Community Chat**: For real-time discussion (if available)
- **Email**: For private matters or security issues

### Getting Support

1. **Check existing issues**: Search for similar problems
2. **Read documentation**: Review available documentation
3. **Ask in discussions**: Post questions in GitHub Discussions
4. **Create issue**: For bugs or feature requests
5. **Contact maintainers**: For urgent or private matters

## 🔒 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:

- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Expected Behavior

- Be respectful and considerate
- Use welcoming and inclusive language
- Focus on constructive feedback
- Be empathetic to other contributors
- Accept feedback gracefully
- Help others learn and grow

### Unacceptable Behavior

- Harassment or discrimination
- Personal attacks or insults
- Spam or irrelevant content
- Violation of privacy
- Trolling or disruptive behavior
- Publishing private information

### Reporting Issues

If you experience or witness unacceptable behavior, please contact:

- **Email**: conduct@your-domain.com
- **GitHub**: Report via GitHub's reporting tools
- **Maintainers**: Contact any project maintainer directly

## 📚 Learning Resources

### Recommended Resources

- **Project documentation**: Read all project docs thoroughly
- **Codebase tutorials**: Explore the codebase structure
- **NestJS documentation**: [docs.nestjs.com](https://docs.nestjs.com/)
- **Prisma documentation**: [www.prisma.io/docs](https://www.prisma.io/docs)
- **Best practices**: Follow industry standards for TypeScript and Node.js
- **Community guidelines**: Learn from other open source projects

### Skill Development

- **Code review**: Participate in reviewing other contributors' PRs
- **Mentorship**: Help new contributors get started
- **Knowledge sharing**: Share what you learn through documentation and discussions
- **Continuous improvement**: Always be learning and improving your skills

## 🎯 Contribution Areas

We particularly welcome contributions in these areas:

### High Priority

- **Security improvements**: Enhanced authentication and authorization
- **Performance optimization**: Database queries, caching strategies
- **Test coverage**: Increasing test coverage for existing code
- **Documentation**: Improving existing documentation

### Medium Priority

- **New features**: Role assignment APIs, bulk operations
- **UI/UX**: If frontend components are added
- **Monitoring**: Enhanced logging and metrics
- **Internationalization**: Multi-language support

### Low Priority

- **Tooling**: Development tools and scripts
- **Examples**: Sample applications and integrations
- **Plugins**: Extensibility features

---

## ✅ Contribution Checklist

Before submitting your contribution:

- [ ] Read and understood these guidelines
- [ ] Set up development environment successfully
- [ ] Created appropriate branch following naming conventions
- [ ] Written clean, well-documented code
- [ ] Added tests for new functionality
- [ ] Ensured all tests pass (npm run test)
- [ ] Fixed any linting issues (npm run lint)
- [ ] Formatted code properly (npm run format)
- [ ] Updated relevant documentation
- [ ] Followed code style guidelines
- [ ] Checked for breaking changes
- [ ] Completed pull request template fully
- [ ] Tested changes manually

---

Thank you for contributing to **RBAC NestJS**! 🎉

Your contributions help make this project better for everyone. We appreciate your time and effort in improving the RBAC system.

*Last updated: March 18, 2026*
