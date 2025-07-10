## Project Overview

Twenty is an open-source CRM platform built with modern web technologies. It's a monorepo using NX workspace with TypeScript, React, and NestJS.

## Key Commands

### Development
```bash
# Start full development stack (frontend + backend + worker)
npm start

# Start individual services
npx nx run twenty-front:start          # Frontend only
npx nx run twenty-server:start         # Backend only
npx nx run twenty-server:worker        # Background worker

# Run tests
npx nx run-many -t test                # All tests
npx nx run twenty-front:test           # Frontend tests
npx nx run twenty-server:test          # Backend tests
npx nx run twenty-front:test:watch     # Frontend tests in watch mode

# Type checking
npx nx run-many -t typecheck           # All projects
npx nx run twenty-front:typecheck      # Frontend only
npx nx run twenty-server:typecheck     # Backend only

# Linting and formatting
npx nx run-many -t lint                # Lint all projects
npx nx run-many -t lint:fix            # Fix linting issues
npx nx run-many -t fmt                 # Format code
npx nx run-many -t fmt:fix             # Format and fix code

# Build
npx nx run-many -t build               # Build all projects
npx nx run twenty-front:build          # Build frontend
npx nx run twenty-server:build         # Build backend
```

### Database
```bash
# Database development (Docker)
make postgres-on-docker                # Start PostgreSQL
make redis-on-docker                   # Start Redis
make clickhouse-on-docker             # Start ClickHouse
```

### Testing
```bash
# Run specific test file
npx nx run twenty-front:test --testNamePattern="ComponentName"
npx nx run twenty-server:test --testNamePattern="ServiceName"

# E2E tests
npx nx run twenty-e2e-testing:test:e2e

# Storybook
npx nx run twenty-front:storybook:serve:dev
npx nx run twenty-ui:storybook:serve:dev
```

## Architecture Overview

### Monorepo Structure
```
packages/
├── twenty-front/        # React frontend (main CRM interface)
├── twenty-server/       # NestJS backend (GraphQL API)
├── twenty-ui/          # Shared UI component library
├── twenty-shared/      # Common utilities and types
├── twenty-emails/      # Email templates (React Email)
├── twenty-docker/      # Docker configuration
├── twenty-website/     # Marketing website (Next.js)
├── twenty-chrome-extension/  # Browser extension
├── twenty-zapier/      # Zapier integration
└── twenty-e2e-testing/ # End-to-end tests (Playwright)
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Recoil (state), Emotion (styling), Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL, BullMQ
- **UI**: Custom design system with Emotion styled-components
- **Testing**: Jest, React Testing Library, Playwright
- **Build**: NX monorepo, SWC compiler
- **Database**: PostgreSQL (main), Redis (cache), ClickHouse (analytics)

### Key Architectural Patterns

#### Frontend (twenty-front)
- **Modular architecture** with domain-based modules
- **Metadata-driven UI** - UI components generated from backend metadata
- **State management** with Recoil atoms and selectors
- **GraphQL-first** data fetching with Apollo Client
- **Component-based** design system from twenty-ui

#### Backend (twenty-server)
- **Domain-driven design** with feature modules
- **Multi-tenant architecture** with workspace isolation
- **GraphQL API** as primary interface (dynamically generated)
- **Event-driven** architecture with listeners and queues
- **Metadata-driven** - dynamic object/field definitions

#### Database Design
- **Core tables** - System-level data (users, workspaces, metadata)
- **Workspace tables** - Tenant-specific data (dynamically created)
- **Metadata tables** - Define custom objects and fields
- **Multi-tenant** with workspace-based isolation

### Core Modules

#### Frontend Key Modules
- `object-record` - Generic record management system
- `object-metadata` - Dynamic schema management
- `views` - List/kanban views and filtering
- `people` - Contact management
- `companies` - Company management
- `activities` - Tasks and notes
- `workflow` - Automation workflows
- `settings` - Configuration and admin panels

#### Backend Key Modules
- `auth` - Authentication (JWT, OAuth, SSO)
- `workspace` - Multi-tenant workspace system
- `messaging` - Email integration (Gmail, Outlook)
- `calendar` - Calendar synchronization
- `workflow` - Automation engine
- `serverless` - Custom serverless functions
- `file-storage` - File upload and management

## Development Guidelines

### Code Style (from .cursor/rules)
- **Functional components only** (no classes)
- **Named exports only** (no default exports)
- **Types over interfaces** (except for extending third-party)
- **No 'any' type allowed**
- **2-space indentation**, single quotes, trailing commas
- **camelCase** for variables/functions, **PascalCase** for types/components
- **kebab-case** for files and directories

### File Organization
- Use **barrel exports** (`index.ts`) for clean imports
- **Colocation** - keep related files together
- **Domain-based modules** - group by business logic, not file type
- **Testing files** alongside source files (`*.test.ts`, `*.spec.ts`)

### GraphQL Conventions
- Use **generated types** from GraphQL schema
- **Fragments** for reusable query parts
- **Queries** in separate files from components
- **Mutations** with proper error handling

### State Management
- **Recoil atoms** for global state
- **Local component state** for UI-only state
- **Selectors** for derived state
- **Effects** for side effects and persistence

## Common Patterns

### Adding New Features
1. **Backend**: Create module in `twenty-server/src/modules/`
2. **Frontend**: Create module in `twenty-front/src/modules/`
3. **Types**: Add shared types to `twenty-shared/src/types/`
4. **Tests**: Write tests for both frontend and backend
5. **Documentation**: Update relevant docs

### Working with Object Metadata
- Objects and fields are defined via metadata (not hardcoded)
- Custom objects can be created through the UI
- GraphQL schema is dynamically generated from metadata
- UI components adapt to metadata definitions

### Database Migrations
- **Core migrations**: System-level schema changes
- **Workspace migrations**: Tenant-specific changes
- Use TypeORM migration system
- Test migrations with different workspace configurations

## Important Notes

- **Multi-tenancy**: Always consider workspace isolation
- **Metadata-driven**: Leverage dynamic object/field system
- **TypeScript strict mode**: All code must be fully typed
- **Performance**: Use React.memo, useMemo, useCallback appropriately
- **Testing**: Maintain test coverage for new features
- **GraphQL**: Prefer GraphQL over REST for new endpoints

## Environment Setup

The project requires:
- **Node.js**: ^22.12.0
- **Yarn**: >=4.0.2
- **PostgreSQL**: 16+
- **Redis**: Latest
- **Docker**: For local development dependencies

## Debugging

### Common Issues
- **Build failures**: Check TypeScript errors with `npx nx run-many -t typecheck`
- **Test failures**: Run tests in watch mode for faster feedback
- **Database issues**: Restart Docker containers or check migrations
- **GraphQL errors**: Check schema generation and type consistency

### Performance Monitoring
- Use **React DevTools** for component profiling
- **Apollo DevTools** for GraphQL query analysis
- **NestJS built-in** profiling for backend performance