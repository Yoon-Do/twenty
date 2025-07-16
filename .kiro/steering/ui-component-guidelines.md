# Twenty CRM - UI & Component Guidelines

## Design System
- **twenty-ui package** contains shared components
- **Emotion/styled-components** for styling
- **Consistent spacing** using theme tokens
- **Responsive design** with mobile-first approach
- **Accessibility** WCAG 2.1 AA compliance

## Component Architecture
```typescript
// Component structure
export const UserCard = ({ user, onEdit }: UserCardProps) => {
  const theme = useTheme();
  
  return (
    <StyledCard>
      <UserAvatar src={user.avatar} alt={user.name} />
      <UserInfo>
        <UserName>{user.name}</UserName>
        <UserEmail>{user.email}</UserEmail>
      </UserInfo>
      <ActionButton onClick={() => onEdit(user)}>
        Edit
      </ActionButton>
    </StyledCard>
  );
};

// Styled components
const StyledCard = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;
```

## Component Patterns
- **Compound components** for complex UI patterns
- **Render props** for flexible composition
- **Custom hooks** for component logic
- **Forward refs** for DOM access
- **Proper prop types** with TypeScript

## Styling Guidelines
```typescript
// Theme-based styling
const StyledButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary : theme.colors.secondary
  };
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
```

## Icon Usage
- **Tabler Icons** as primary icon library
- **Consistent sizing** (16px, 20px, 24px)
- **Semantic naming** for icon components
- **Proper accessibility** with aria-labels

## Form Components
- **React Hook Form** for form management
- **Zod validation** schemas
- **Consistent error handling** and display
- **Proper field labeling** and descriptions

## Data Display
- **React Data Grid** for tables
- **Virtualization** for large datasets
- **Sorting and filtering** capabilities
- **Responsive table** behavior

## Navigation
- **React Router** for client-side routing
- **Breadcrumb navigation** for deep pages
- **Consistent navigation** patterns
- **Proper focus management**

## Loading States
- **Skeleton loaders** for content
- **Spinner components** for actions
- **Progressive loading** for large datasets
- **Error boundaries** for graceful failures

## Accessibility
- **Semantic HTML** elements
- **ARIA attributes** where needed
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** compliance