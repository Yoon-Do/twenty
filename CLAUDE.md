# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Twenty is an open-source CRM built with TypeScript, using NX for monorepo management. It consists of a NestJS backend, React frontend, and various supporting packages.

**Stack:**
- TypeScript, NX (monorepo)
- Backend: NestJS, BullMQ, PostgreSQL, Redis, TypeORM
- Frontend: React, Recoil, Emotion, Lingui
- Testing: Jest, Playwright
- Build: Vite, SWC

## Repository Structure

This is an NX monorepo with packages in `/packages/`:

- `twenty-server/` - Main NestJS backend API
- `twenty-front/` - React frontend application
- `twenty-ui/` - Shared UI component library
- `twenty-shared/` - Shared utilities and types
- `twenty-emails/` - Email templates and rendering
- `twenty-website/` - Next.js marketing website
- `twenty-chrome-extension/` - Browser extension
- `twenty-e2e-testing/` - Playwright end-to-end tests

## Common Commands

### Development
```bash
# Start both frontend and backend with worker
npm start

# Start specific packages
npx nx start twenty-server
npx nx start twenty-front

# Run backend worker
npx nx run twenty-server:worker
```

### Building
```bash
# Build all packages
npx nx run-many -t build

# Build specific package
npx nx build twenty-server
npx nx build twenty-front
```

### Linting & Formatting
```bash
# Lint specific package
npx nx lint twenty-server
npx nx lint twenty-front

# Lint with auto-fix
npx nx lint twenty-server --fix

# Format code
npx nx fmt twenty-server --write
```

### Testing
```bash
# Frontend tests
npx nx test twenty-front                    # Run unit tests
npx nx storybook:build twenty-front         # Build Storybook
npx nx storybook:serve-and-test:static      # Run Storybook tests

# Backend tests
npx nx test twenty-server                   # Run unit tests
npx nx run twenty-server:test:integration:with-db-reset # Integration tests

# Run specific test file
npx nx test twenty-server --testPathPattern="specific-test"

# Run tests in watch mode
npx nx test twenty-server --watch

# Run e2e tests
npx nx test:e2e twenty-e2e-testing
```

### Database Operations
```bash
# Reset database
npx nx database:reset twenty-server

# Initialize database
npx nx run twenty-server:database:init:prod

# Run migrations
npx nx run twenty-server:database:migrate:prod

# Generate migration
npx nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/[name] -d src/database/typeorm/core/core.datasource.ts

# Sync metadata
npx nx run twenty-server:command workspace:sync-metadata -f
```

### Type Checking
```bash
# Type check
npx nx typecheck twenty-server
npx nx typecheck twenty-front
```

## Backend Architecture (twenty-server)

### Core Structure
```
src/
├── engine/                    # Core engine modules
│   ├── core-modules/         # Business logic modules
│   │   ├── auth/            # Authentication & authorization
│   │   ├── user/            # User management
│   │   ├── workspace/       # Multi-tenant workspaces
│   │   ├── admin-panel/     # Admin panel functionality
│   │   └── ...
│   ├── metadata-modules/     # Dynamic metadata system
│   │   ├── object-metadata/ # Object definitions
│   │   ├── field-metadata/  # Field definitions
│   │   └── permissions/     # Permission system
│   └── guards/              # Authentication & authorization guards
├── database/                # Database configuration & migrations
├── modules/                 # Feature-specific modules
└── utils/                   # Shared utilities
```

### Key Patterns

**Metadata-driven Architecture**: Twenty uses a dynamic metadata system where objects and fields are defined at runtime, enabling customizable data models per workspace.

**Multi-tenancy**: Each workspace has its own schema in PostgreSQL, isolated from other workspaces.

**Permission System**: Multi-layered permissions (workspace, role, object, field) with guards protecting GraphQL resolvers and REST endpoints.

**Module Structure**: NestJS modules follow a consistent pattern:
- `*.module.ts` - Module definition with providers/imports
- `*.service.ts` - Business logic
- `*.resolver.ts` - GraphQL resolvers
- `*.entity.ts` - TypeORM entities
- `__tests__/` - Test files

### Authentication Flow
1. JWT tokens for user authentication
2. Workspace-scoped permissions
3. Multiple token types: LOGIN, API_KEY, SUPER_ADMIN
4. Guards validate tokens and permissions at resolver level

### GraphQL Schema
- Auto-generated from TypeORM entities and metadata
- Dynamic schema per workspace based on custom objects
- Uses `@ptc-org/nestjs-query` for CRUD operations

## Frontend Architecture (twenty-front)

### Structure
```
src/
├── modules/               # Feature modules
│   ├── auth/             # Authentication
│   ├── object-record/    # Dynamic record management
│   ├── settings/         # Workspace settings
│   ├── ui/              # UI components
│   └── ...
├── pages/               # Route components
├── generated/           # Auto-generated GraphQL types
└── utils/               # Shared utilities
```

### Key Patterns

**Recoil State Management**: Uses Recoil for state management with atoms and selectors.

**Dynamic UI**: Components adapt to dynamic object metadata from backend.

**Module-based Architecture**: Each feature is a self-contained module with its own components, hooks, and state.

## Development Guidelines & Coding Standards

### Core Principles (from .cursor/rules)
- **Functional components only** (no classes)
- **Named exports only** (no default exports)  
- **Types over interfaces** (except for extending third-party)
- **String literals over enums** (except GraphQL)
- **No 'any' type allowed**
- **Event handlers over useEffect** for state updates

### TypeScript Standards
- Strict TypeScript mode enabled
- Use `type` for all type definitions, not `interface`
- Component prop types must be suffixed with 'Props'
- Leverage type inference when clear, explicit typing when ambiguous
- Use string literal unions instead of enums
- Use discriminated unions for type safety

```typescript
// ✅ Correct
type UserRole = 'admin' | 'user' | 'guest';
type UserProps = {
  user: User;
  onEdit: (id: string) => void;
};

// ❌ Incorrect
interface UserProps {
  user: User;
  onEdit: (id: string) => void;
}
enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}
```

### React Patterns
- Small, focused components with single responsibility
- Composition over inheritance
- Destructure props in function parameters
- Extract complex logic into custom hooks
- Use memo only for expensive components
- Memoize callbacks when necessary

```typescript
// ✅ Correct component structure
export const UserProfile = ({ user, onEdit }: UserProfileProps) => {
  const handleEdit = () => onEdit(user.id);
  
  return (
    <StyledContainer>
      <h1>{user.name}</h1>
      <Button onClick={handleEdit}>Edit</Button>
    </StyledContainer>
  );
};
```

### Working with NX
- Use `npx nx` commands rather than direct npm/yarn
- Build dependencies automatically handled
- Caching enabled for faster builds
- View dependency graph: `npx nx graph`
- Check affected projects: `npx nx affected --target=test`

### Testing Strategy
Follow the testing pyramid: 70% unit, 20% integration, 10% E2E

**Testing Principles:**
- Test behavior, not implementation
- Use descriptive test names: "should [behavior] when [condition]"
- Query by user-visible elements (text, roles, labels) over test IDs
- Keep tests isolated and repeatable
- Use AAA pattern (Arrange, Act, Assert)

```typescript
// ✅ Good test structure
describe('UserService', () => {
  describe('when getting user by ID', () => {
    it('should return user data for valid ID', async () => {
      // Arrange
      const userId = '123';
      const expectedUser = { id: '123', name: 'John' };
      mockUserRepository.findById.mockResolvedValue(expectedUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
    });
  });
});
```

**Test Types:**
- Unit tests with Jest for services and utilities
- Integration tests for API endpoints and resolvers
- E2E tests with Playwright for critical user flows
- Storybook for component testing

### Code Generation
- GraphQL types auto-generated from schema
- Run `npx nx run twenty-front:graphql:generate` after schema changes
- Metadata GraphQL types: `npx nx run twenty-front:graphql:generate-metadata`

### Database Migrations
```bash
# Generate migration
npx nx run twenty-server:typeorm -- migration:generate

# Run migrations
npx nx run twenty-server:database:migrate
```

### Environment Setup
- Copy `.env.example` files in each package
- Set up PostgreSQL and Redis locally
- Use `yarn install` (not npm) - enforced by engines

### Permission System Deep Dive

The permission system has multiple layers:
1. **Workspace Membership** - User must be in workspace
2. **Role Permissions** - User's role defines access levels
3. **Object Permissions** - Per-object access control
4. **Field Permissions** - Per-field access control

Guards enforce these at GraphQL resolver level:
- `WorkspaceAuthGuard` - Validates workspace access
- `UserAuthGuard` - Validates user authentication  
- `AdminPanelGuard` - Restricts admin functionality
- Custom permission guards for specific features

### Super Admin System

Recently implemented cross-workspace access system:
- `SuperAdminGuard` - Validates super admin context
- `SuperAdminPermissionsService` - Bypasses all permission checks
- `SuperAdminTokenService` - Generates special tokens
- Enhanced guards detect super admin and allow access

## Important Files

### Configuration
- `nx.json` - NX workspace configuration
- `package.json` - Root dependencies and scripts
- `tsconfig.base.json` - Base TypeScript configuration

### Backend Key Files
- `twenty-server/src/app.module.ts` - Main application module
- `twenty-server/src/engine/` - Core engine implementation
- `twenty-server/src/database/` - Database configuration

### Frontend Key Files  
- `twenty-front/src/index.tsx` - Application entry point
- `twenty-front/src/modules/` - Feature modules
- `twenty-front/codegen.cjs` - GraphQL code generation

## Troubleshooting

### Common Issues
- **Database connection**: Ensure PostgreSQL and Redis are running
- **Type errors**: Run GraphQL code generation after schema changes
- **Permission errors**: Check user workspace membership and roles
- **Build failures**: Clear NX cache with `npx nx reset`

### Linting Rules
The project has extensive custom ESLint rules in `tools/eslint-rules/`:
- Component naming conventions
- GraphQL resolver guarding requirements
- Styled components prefixing
- Import organization

### Cache Management
- NX caches build outputs in `.cache/`
- Jest caches in `.cache/jest/`
- Clear all caches: `npx nx reset`