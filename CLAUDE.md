# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Twenty is an open-source CRM built as a monorepo using Nx workspace. The codebase follows a modular, metadata-driven architecture with TypeScript throughout.

## Technology Stack

- **Frontend**: React 18, TypeScript, Recoil, Styled Components, Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL 
- **Monorepo**: Nx workspace with Yarn 4.x
- **Testing**: Jest, Storybook, Playwright (E2E)

## Package Structure

```
packages/
├── twenty-front/        # React frontend application
├── twenty-server/       # NestJS backend API
├── twenty-ui/          # Shared React component library
├── twenty-shared/      # Common types and utilities
├── twenty-emails/      # Email templates and components
├── twenty-chrome-extension/ # Browser extension
├── twenty-zapier/      # Zapier integration
├── twenty-website/     # Marketing website (Next.js)
└── twenty-e2e-testing/ # End-to-end tests
```

## Common Development Commands

### Frontend Development
```bash
# Start frontend development server
npx nx start twenty-front

# Run tests
npx nx test twenty-front
npx nx test twenty-front --watch

# Type checking
npx nx typecheck twenty-front

# Linting (add --fix to auto-fix)
npx nx lint twenty-front

# Generate GraphQL types
npx nx run twenty-front:graphql:generate

# Storybook
npx nx storybook:serve:dev twenty-front
npx nx storybook:build twenty-front
```

### Backend Development
```bash
# Start backend server
npx nx start twenty-server

# Run worker process
npx nx run twenty-server:worker

# Run tests
npx nx test twenty-server
npx nx run twenty-server:test:integration:with-db-reset

# Database operations
npx nx database:reset twenty-server
npx nx run twenty-server:database:init:prod
npx nx run twenty-server:database:migrate:prod

# Generate TypeORM migration
npx nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/[name] -d src/database/typeorm/core/core.datasource.ts

# Sync workspace metadata
npx nx run twenty-server:command workspace:sync-metadata -f

# Type checking and linting
npx nx typecheck twenty-server
npx nx lint twenty-server
```

### Shared Libraries
```bash
# Test shared packages
npx nx test twenty-ui
npx nx test twenty-shared

# Build libraries
npx nx build twenty-ui
npx nx build twenty-shared
```

### Full Stack Development
```bash
# Start both frontend and backend
yarn start

# Run all tests
npx nx run-many --target=test --all

# Run affected tests (based on git changes)
npx nx affected --target=test

# Build all packages
npx nx run-many --target=build --all
```

## Architecture Patterns

### Frontend Architecture (twenty-front)

**Module-Based Organization**: Features are organized into self-contained modules under `src/modules/` with consistent structure:
- `components/` - React components
- `hooks/` - Custom hooks
- `states/` - Recoil state management
- `utils/` - Utility functions
- `types/` - TypeScript definitions
- `graphql/` - GraphQL queries and mutations

**State Management**: Uses Recoil with custom state factory from twenty-ui. Extensive use of component-scoped state and family selectors for dynamic state management.

**GraphQL Integration**: Apollo Client with custom factory for authentication, automatic code generation for types and queries, and optimistic updates for mutations.

### Backend Architecture (twenty-server)

**Layered Architecture**: Clear separation between core engine modules and feature modules. Multi-tenant workspace isolation with dynamic schema generation.

**Metadata-Driven**: Object metadata defines both database schema and GraphQL schema at runtime. Schema generation and migrations based on metadata.

**Repository Pattern**: Custom repository decorators extending TypeORM, with workspace-scoped repositories and twenty-orm abstraction layer.

### Key Architectural Principles

1. **Metadata-Driven Development**: Use object metadata system for dynamic behavior rather than hardcoding
2. **Workspace Isolation**: Multi-tenant architecture - all features must respect workspace boundaries  
3. **Type Safety**: Leverage code generation and TypeScript throughout the stack
4. **Modular Design**: Follow established module patterns for organization
5. **Event-Driven Updates**: Use workspace event emitters for cross-module communication

## Development Guidelines

### Code Style
- **Functional components only** (no class components)
- **Named exports only** (no default exports)  
- **Types over interfaces** (except for extending third-party)
- **String literals over enums** (except GraphQL enums)
- **No 'any' type allowed**
- **Event handlers over useEffect** for state updates

### Component Patterns
- Use component-scoped state with Recoil
- Extract complex logic into custom hooks
- Follow compound component patterns for complex UIs
- Use React Context with `createRequiredContext` utility

### Testing
- Unit tests with Jest for all new features
- Storybook stories for UI components
- Integration tests for backend services
- E2E tests with Playwright for critical user flows

### Database & Migrations
- Use TypeORM migrations for core schema changes
- Leverage metadata system for workspace schema changes
- Always test migrations with database reset commands
- Maintain workspace isolation in all database operations

## Important Notes

- **Node.js Version**: Requires Node.js ^22.12.0 (specified in package.json engines)
- **Package Manager**: Uses Yarn 4.x (do not use npm)
- **Environment Setup**: Requires PostgreSQL and Redis for backend development
- **Workspace Metadata**: Changes to object metadata require workspace sync command
- **Permission System**: Always implement proper permission checking for new features
- **Multi-tenancy**: All new features must work within workspace isolation

## Testing Your Changes

Always run these commands before committing:
```bash
# Type checking
npx nx typecheck twenty-front
npx nx typecheck twenty-server

# Linting  
npx nx lint twenty-front
npx nx lint twenty-server

# Tests
npx nx test twenty-front
npx nx test twenty-server
```

For database-related changes, also run:
```bash
npx nx database:reset twenty-server
npx nx run twenty-server:command workspace:sync-metadata -f
```