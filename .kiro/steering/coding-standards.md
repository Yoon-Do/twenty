# Twenty CRM - Coding Standards

## Code Style & Formatting
- **Prettier**: 2-space indentation, single quotes, trailing commas, semicolons
- **Print width**: 80 characters max
- **ESLint**: Strict rules with no unused imports, consistent ordering

## TypeScript Guidelines
- **Strict mode enabled** - no `any` types allowed
- **Types over interfaces** (except when extending third-party)
- **String literals over enums** (except GraphQL enums)
- **Named exports only** - no default exports
- **Explicit return types** for public functions

## React Patterns
- **Functional components only** - no class components
- **Custom hooks** for reusable logic
- **Event handlers over useEffect** for state updates
- **Recoil** for global state management
- **Emotion/styled-components** for styling

## Naming Conventions
```typescript
// Variables and functions - camelCase
const userAccountBalance = 1000;
const calculateTotalPrice = () => {};

// Constants - SCREAMING_SNAKE_CASE
const API_ENDPOINTS = {
  USERS: '/api/users',
} as const;

// Types and interfaces - PascalCase
type UserData = {};
type ComponentProps = {}; // Suffix with 'Props'

// Files and directories - kebab-case
// user-profile.component.tsx
// user-service.ts
```

## Import Organization
```typescript
// 1. External libraries
import React from 'react';
import styled from 'styled-components';

// 2. Internal modules (absolute paths)
import { Button } from '@/ui/components';
import { userService } from '@/services';

// 3. Relative imports
import { UserCardProps } from './types';
```

## Error Handling
- Use custom error classes with meaningful messages
- Proper error logging with context
- Graceful fallbacks in UI components
- Validation with Zod schemas