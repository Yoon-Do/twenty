# Twenty CRM - Architecture Guidelines

## Monorepo Structure
```
packages/
├── twenty-front/         # React frontend application
├── twenty-server/        # NestJS backend API
├── twenty-ui/           # Shared UI component library
├── twenty-shared/       # Common types and utilities
├── twenty-emails/       # Email templates and services
├── twenty-utils/        # Utility functions
├── twenty-chrome-extension/ # Browser extension
├── twenty-website/      # Marketing website
└── twenty-zapier/       # Zapier integration
```

## Package Boundaries
- **Scope tags** enforce dependencies via Nx
- `scope:shared` - Can only depend on other shared packages
- `scope:frontend` - Can depend on shared and frontend packages
- `scope:backend` - Can depend on shared and backend packages

## Frontend Architecture (twenty-front)
```
src/
├── components/          # Reusable UI components
├── pages/              # Route-level components
├── modules/            # Feature modules (users, companies, etc.)
├── hooks/              # Custom React hooks
├── services/           # API services and GraphQL queries
├── state/              # Recoil atoms and selectors
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Backend Architecture (twenty-server)
```
src/
├── modules/            # Feature modules (NestJS modules)
├── entities/           # TypeORM database entities
├── dto/               # Data transfer objects
├── guards/            # Authentication/authorization guards
├── decorators/        # Custom decorators
├── services/          # Business logic services
├── resolvers/         # GraphQL resolvers
└── utils/             # Helper functions
```

## Module Structure Pattern
```
src/modules/user/
├── components/         # Module-specific components
├── hooks/             # Module-specific hooks
├── services/          # API services for this module
├── types/             # Module type definitions
├── constants/         # Module constants
└── index.ts           # Barrel exports
```

## GraphQL Schema Design
- **Code-first approach** with decorators
- **Strongly typed** resolvers and DTOs
- **Pagination** with cursor-based approach
- **Field-level permissions** with guards
- **Subscription support** for real-time updates

## Database Design
- **PostgreSQL** as primary database
- **TypeORM** with decorators and migrations
- **Soft deletes** for audit trails
- **UUID primary keys** for all entities
- **Proper indexing** for performance