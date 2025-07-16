# Twenty CRM - Development Workflow

## Development Commands
```bash
# Start full development environment
yarn start

# Start individual packages
nx serve twenty-front
nx serve twenty-server

# Run tests
nx test twenty-front
nx test twenty-server
nx run-many -t test

# Build packages
nx build twenty-front
nx build twenty-server

# Lint and format
nx lint twenty-front
nx run-many -t lint
nx run-many -t fmt --fix
```

## Docker Development
```bash
# Start PostgreSQL
make postgres-on-docker

# Start Redis
make redis-on-docker

# Start full stack with Docker Compose
docker-compose up -d
```

## Testing Strategy
- **Unit tests**: Jest with React Testing Library
- **Integration tests**: API endpoint testing
- **E2E tests**: Playwright for critical user flows
- **Component tests**: Storybook with interaction testing
- **Visual regression**: Chromatic for UI changes

## Git Workflow
- **Feature branches** from `main`
- **Conventional commits** for clear history
- **PR reviews** required before merge
- **Automated checks** must pass (tests, lint, build)
- **Squash and merge** to keep history clean

## Code Quality Gates
- **ESLint** - No warnings allowed
- **Prettier** - Consistent formatting
- **TypeScript** - Strict type checking
- **Test coverage** - Minimum thresholds
- **Bundle size** - Performance budgets

## Environment Setup
- **Node.js 22.12.0** (see .nvmrc)
- **Yarn 4.9.2** package manager
- **PostgreSQL 16** database
- **Redis** for caching and queues

## Local Development
1. Clone repository
2. Install dependencies: `yarn install`
3. Start databases: `make postgres-on-docker redis-on-docker`
4. Copy environment: `cp .env.example .env`
5. Run migrations: `nx database:migrate twenty-server`
6. Start development: `yarn start`

## Debugging
- **VSCode launch configs** in `.vscode/launch.json`
- **Chrome DevTools** for frontend debugging
- **NestJS debugging** with source maps
- **GraphQL Playground** at `/graphql`