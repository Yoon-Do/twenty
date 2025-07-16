# Twenty CRM - Testing Guidelines

## Testing Strategy
- **Unit tests**: Jest for individual functions and components
- **Integration tests**: API endpoints and database interactions
- **E2E tests**: Playwright for critical user journeys
- **Component tests**: Storybook with interaction testing
- **Visual regression**: Chromatic for UI consistency

## Frontend Testing (React)
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './user-card.component';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('should display user information', () => {
    render(<UserCard user={mockUser} onEdit={jest.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

## Custom Hook Testing
```typescript
// Testing custom hooks
import { renderHook, act } from '@testing-library/react';
import { useUserForm } from './use-user-form.hook';

describe('useUserForm', () => {
  it('should initialize with empty form', () => {
    const { result } = renderHook(() => useUserForm());
    
    expect(result.current.formData).toEqual({
      firstName: '',
      lastName: '',
      email: '',
    });
  });

  it('should update form data', () => {
    const { result } = renderHook(() => useUserForm());
    
    act(() => {
      result.current.updateField('firstName', 'John');
    });
    
    expect(result.current.formData.firstName).toBe('John');
  });
});
```

## Backend Testing (NestJS)
```typescript
// Service testing
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockRepository = module.get(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const userData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
    const savedUser = { id: '1', ...userData };
    
    mockRepository.save.mockResolvedValue(savedUser);
    
    const result = await service.create(userData);
    expect(result).toEqual(savedUser);
    expect(mockRepository.save).toHaveBeenCalledWith(userData);
  });
});
```

## GraphQL Resolver Testing
```typescript
// Resolver testing
import { Test } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get(UserService);
  });

  it('should return users', async () => {
    const users = [{ id: '1', firstName: 'John', lastName: 'Doe' }];
    userService.findMany.mockResolvedValue(users);

    const result = await resolver.findUsers();
    expect(result).toEqual(users);
  });
});
```

## E2E Testing (Playwright)
```typescript
// E2E test example
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test('should create a new user', async ({ page }) => {
    await page.goto('/users');
    
    // Click create user button
    await page.click('[data-testid="create-user-button"]');
    
    // Fill form
    await page.fill('[data-testid="first-name-input"]', 'John');
    await page.fill('[data-testid="last-name-input"]', 'Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    
    // Submit form
    await page.click('[data-testid="submit-button"]');
    
    // Verify user was created
    await expect(page.locator('[data-testid="user-list"]')).toContainText('John Doe');
  });
});
```

## Storybook Testing
```typescript
// Storybook interaction tests
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { UserCard } from './user-card.component';

const meta: Meta<typeof UserCard> = {
  title: 'Components/UserCard',
  component: UserCard,
};

export default meta;
type Story = StoryObj<typeof UserCard>;

export const Default: Story = {
  args: {
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    },
  },
};

export const InteractionTest: Story = {
  args: Default.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test edit button click
    const editButton = canvas.getByText('Edit');
    await userEvent.click(editButton);
    
    // Verify interaction
    await expect(editButton).toBeInTheDocument();
  },
};
```

## Test Data Management
```typescript
// Test factories
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Database seeding for tests
export const seedTestDatabase = async () => {
  const users = [
    createMockUser({ id: '1', firstName: 'John' }),
    createMockUser({ id: '2', firstName: 'Jane' }),
  ];
  
  await userRepository.save(users);
};
```

## Coverage Requirements
- **Unit tests**: 80% minimum coverage
- **Integration tests**: Critical paths covered
- **E2E tests**: Happy path and error scenarios
- **Component tests**: All interactive components