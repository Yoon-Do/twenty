# Twenty CRM - API & GraphQL Guidelines

## GraphQL Schema Design
- **Code-first approach** using NestJS decorators
- **Strongly typed** with TypeScript
- **Consistent naming** conventions (camelCase)
- **Proper error handling** with custom exceptions
- **Field-level permissions** with guards

## Query Patterns
```typescript
// Query example
@Query(() => [User])
@UseGuards(JwtAuthGuard)
async findUsers(
  @Args('filter', { nullable: true }) filter?: UserFilterInput,
  @Args('pagination', { nullable: true }) pagination?: PaginationInput,
): Promise<User[]> {
  return this.userService.findMany(filter, pagination);
}

// Mutation example
@Mutation(() => User)
@UseGuards(JwtAuthGuard)
async createUser(
  @Args('input') input: CreateUserInput,
  @CurrentUser() currentUser: User,
): Promise<User> {
  return this.userService.create(input, currentUser);
}
```

## Input/Output Types
```typescript
// Input types for mutations
@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(2)
  firstName: string;

  @Field()
  @IsString()
  @MinLength(2)
  lastName: string;
}

// Filter types for queries
@InputType()
export class UserFilterInput {
  @Field({ nullable: true })
  email?: StringFilter;

  @Field({ nullable: true })
  firstName?: StringFilter;

  @Field(() => [ID], { nullable: true })
  ids?: string[];
}
```

## Pagination
```typescript
// Cursor-based pagination
@ObjectType()
export class UserConnection {
  @Field(() => [UserEdge])
  edges: UserEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}

@ObjectType()
export class UserEdge {
  @Field()
  cursor: string;

  @Field(() => User)
  node: User;
}
```

## Error Handling
```typescript
// Custom exceptions
export class UserNotFoundError extends NotFoundException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
  }
}

// Error handling in resolvers
@Mutation(() => User)
async updateUser(
  @Args('id') id: string,
  @Args('input') input: UpdateUserInput,
): Promise<User> {
  try {
    return await this.userService.update(id, input);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      throw new UserNotFoundError(id);
    }
    throw new InternalServerErrorException('Failed to update user');
  }
}
```

## Subscriptions
```typescript
// Real-time subscriptions
@Subscription(() => User, {
  filter: (payload, variables) => {
    return payload.userUpdated.workspaceId === variables.workspaceId;
  },
})
userUpdated(
  @Args('workspaceId') workspaceId: string,
) {
  return this.pubSub.asyncIterator('userUpdated');
}
```

## Data Loaders
```typescript
// Efficient data loading
@Injectable()
export class UserLoader {
  constructor(private userService: UserService) {}

  @Loader(User, 'companies')
  async getCompanies(userIds: string[]): Promise<Company[][]> {
    const companies = await this.userService.findCompaniesByUserIds(userIds);
    return userIds.map(id => companies.filter(c => c.userId === id));
  }
}
```

## Authentication & Authorization
```typescript
// JWT authentication guard
@UseGuards(JwtAuthGuard)
@Query(() => User)
async currentUser(@CurrentUser() user: User): Promise<User> {
  return user;
}

// Role-based authorization
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Mutation(() => Boolean)
async deleteUser(@Args('id') id: string): Promise<boolean> {
  return this.userService.delete(id);
}
```

## Frontend GraphQL Usage
```typescript
// Apollo Client queries
const GET_USERS = gql`
  query GetUsers($filter: UserFilterInput, $pagination: PaginationInput) {
    users(filter: $filter, pagination: $pagination) {
      id
      email
      firstName
      lastName
      createdAt
    }
  }
`;

// React hook usage
const { data, loading, error } = useQuery(GET_USERS, {
  variables: { filter: { email: { contains: searchTerm } } },
});
```