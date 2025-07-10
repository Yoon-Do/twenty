# Super Admin Setup Guide

This guide explains how to set up super admin accounts in Twenty CRM to access the super admin features like the workspaces management interface.

## Overview

The super admin feature allows designated users to:
- View all workspaces in the system
- Create, manage, and delete workspaces
- Activate/deactivate workspaces
- Manage all users in the system
- Access comprehensive workspace and user management interfaces

## Implementation Status

✅ **Backend Implementation (Complete)**
- Added `isSuperAdmin` field to User entity
- Created database migration for `isSuperAdmin` column
- Implemented `SuperAdminGuard` to protect admin endpoints
- Created `AdminModule` with `AdminResolver` and `AdminService`
- **Workspace Management**: Full CRUD operations for workspaces
  - Create, read, update, delete workspaces
  - Activate/deactivate workspace functionality
  - Workspace search and filtering
- **User Management**: Comprehensive user administration
  - Enable/disable user accounts
  - View user details and workspace memberships
  - Super admin promotion/demotion
- **GraphQL API**: Complete admin endpoints with proper authorization
- **Super Admin Workspace Access**: Allow super admins to access any workspace
  - Modified JWT authentication to bypass userWorkspace validation
  - Updated access token generation to work without workspace membership
  - Enhanced authentication service to skip workspace invitation checks
  - Fixed user resolver to handle super admins without userWorkspace records

✅ **Frontend Implementation (Complete)**
- **Admin Workspaces Interface**: Modern card-based workspace management
  - View all workspaces with status indicators
  - Create new workspaces with form validation
  - Activate/deactivate workspaces with real-time updates
  - Delete workspaces with confirmation dialogs
- **Admin Users Interface**: Comprehensive user management
  - View all users with role and status badges
  - Enable/disable user accounts
  - Current user highlighting and role indicators
- **Navigation & Routing**: Updated admin panel with workspace/user sections
- **UI/UX**: Consistent design following Twenty's design system
  - Standard button components and hover states
  - Modal dialogs with proper structure
  - Loading states and error handling

## Prerequisites

- Access to the database (PostgreSQL)
- Admin access to the Twenty application
- Knowledge of SQL commands

## Setup Instructions

### 1. Enable Super Admin for a User

To grant super admin privileges to a user, you need to update their record in the database:

```sql
-- Connect to your Twenty database
-- Replace 'user@example.com' with the actual email of the user you want to make a super admin

UPDATE core.user 
SET "isSuperAdmin" = true 
WHERE email = 'user@example.com';
```

### 2. Verify the Setup

To verify that the super admin setup is working:

1. **Check the database update:**
```sql
SELECT id, email, "firstName", "lastName", "isSuperAdmin" 
FROM core.user 
WHERE "isSuperAdmin" = true;
```

2. **Test the GraphQL endpoints** (after logging in as the super admin user):

**Workspace Management:**
```graphql
# Get all workspaces
query GetWorkspaces {
  workspaces {
    id
    displayName
    subdomain
    createdAt
    activationStatus
    allowImpersonation
  }
}

# Create a new workspace
mutation CreateWorkspace($data: CreateWorkspaceInput!) {
  createWorkspace(data: $data) {
    id
    displayName
    subdomain
    activationStatus
  }
}
```

**User Management:**
```graphql
# Get all users
query GetUsers {
  users {
    id
    firstName
    lastName
    email
    disabled
    isSuperAdmin
    canAccessFullAdminPanel
    canImpersonate
  }
}
```

### 3. Testing the UI

1. **Start the development server:**
```bash
npm start
```

2. **Login** with the super admin user account

3. **Navigate to Settings** → **Admin Panel**

4. **Test Workspace Management**:
   - Go to **Admin Panel** → **Workspaces**
   - Verify you can see all workspaces with status badges
   - Test creating a new workspace using the "Create Workspace" button
   - Test activating/deactivating workspaces
   - Test deleting workspaces (with confirmation dialog)

5. **Test User Management**:
   - Go to **Admin Panel** → **Users** 
   - Verify you can see all users with role and status indicators
   - Test enabling/disabling user accounts
   - Verify current user is highlighted with "This is you" indicator

6. **Verify Navigation**:
   - The "Users" and "Workspaces" sub-menu items should be visible under Admin Panel
   - These sections are only visible to super admin users

## Architecture Details

### Backend Components

**Core Infrastructure:**
- **User Entity**: `packages/twenty-server/src/engine/core-modules/user/user.entity.ts`
- **Workspace Entity**: `packages/twenty-server/src/engine/core-modules/workspace/workspace.entity.ts`
- **Migration**: `packages/twenty-server/src/database/typeorm/core/migrations/common/1752140524000-addIsSuperAdminToUser.ts`
- **Guard**: `packages/twenty-server/src/engine/guards/super-admin.guard.ts`

**Admin Module:**
- **AdminService**: `packages/twenty-server/src/engine/core-modules/admin/admin.service.ts`
  - Workspace CRUD operations
  - User management functions
  - Search and filtering
- **AdminResolver**: `packages/twenty-server/src/engine/core-modules/admin/admin.resolver.ts`
  - GraphQL mutations and queries
  - Input validation and type definitions

### Frontend Components

**Workspace Management:**
- **AdminWorkspacesList**: `packages/twenty-front/src/modules/admin/components/AdminWorkspacesList.tsx`
- **CreateWorkspaceModal**: `packages/twenty-front/src/modules/admin/components/CreateWorkspaceModal.tsx`
- **Workspace Mutations**: `packages/twenty-front/src/modules/admin/graphql/mutations/workspaceManagement.ts`
- **Workspace Queries**: `packages/twenty-front/src/modules/admin/graphql/queries/getWorkspaces.ts`

**User Management:**
- **AdminUsersList**: `packages/twenty-front/src/modules/admin/components/AdminUsersList.tsx`
- **User Mutations**: `packages/twenty-front/src/modules/admin/graphql/mutations/userManagement.ts`
- **User Queries**: `packages/twenty-front/src/modules/admin/graphql/queries/getUsers.ts`

**Pages & Navigation:**
- **Admin Workspaces Page**: `packages/twenty-front/src/pages/settings/admin/SettingsAdminWorkspaces.tsx`
- **Admin Users Page**: `packages/twenty-front/src/pages/settings/admin/SettingsAdminUsers.tsx`
- **Navigation Updates**: `packages/twenty-front/src/modules/settings/hooks/useSettingsNavigationItems.tsx`

### Database Schema

The `isSuperAdmin` field has been added to the `core.user` table:

```sql
ALTER TABLE core.user 
ADD COLUMN "isSuperAdmin" boolean DEFAULT false;
```

## Security Considerations

- Super admin privileges should be granted sparingly and only to trusted administrators
- Regular audits of super admin users should be conducted
- Consider implementing additional logging for super admin actions
- The super admin flag is separate from `canAccessFullAdminPanel` and `canImpersonate` flags

## Available Features

### Workspace Management
- **View Workspaces**: See all workspaces with status indicators (Active, Inactive, Pending Creation)
- **Create Workspaces**: Create new workspaces with subdomain validation
- **Activate/Deactivate**: Toggle workspace activation status
- **Delete Workspaces**: Remove workspaces with confirmation dialogs
- **Workspace Details**: View creation dates, settings, and subdomain information

### User Management  
- **View Users**: See all users with role badges (Super Admin, Admin, Impersonator, User)
- **User Status**: View active/disabled status with visual indicators
- **Enable/Disable**: Toggle user account status
- **Current User**: Special highlighting for the logged-in admin
- **User Details**: View email, join dates, workspace memberships

### Security Features
- **Role-based Access**: Only super admins can access admin panels
- **Action Confirmations**: Destructive actions require confirmation
- **Real-time Updates**: UI updates immediately after actions
- **Error Handling**: Graceful handling of failed operations

## Troubleshooting

### Common Issues

1. **Admin menus not visible**: 
   - Verify the user has `isSuperAdmin = true` in the database
   - Clear browser cache and refresh the page
   - Check the browser console for any JavaScript errors
   - Ensure you're navigating to Settings → Admin Panel

2. **GraphQL permission errors**:
   - Ensure the `SuperAdminGuard` is properly applied to the resolver
   - Verify that the user's session includes the updated `isSuperAdmin` field
   - Try logging out and logging back in to refresh the session

3. **"Current user workspace not found" error for super admin**:
   - This was a previous issue that has been fixed in the latest implementation
   - Super admins can now access any workspace without being a member
   - The `UserResolver.currentUser` now handles super admins without userWorkspace records
   - If you still see this error, ensure you're using the latest code and restart the server

4. **Super admin cannot access specific workspace**:
   - Verify the user has `isSuperAdmin = true` in the database
   - Check that the JWT authentication includes the super admin flag
   - Ensure the workspace exists and is accessible
   - Try logging out and logging back in to refresh the authentication token
   - Super admins can access any workspace by navigating directly to its URL

5. **Workspace creation fails**:
   - Check subdomain validation (3-30 characters, lowercase, alphanumeric + hyphens)
   - Ensure subdomain is unique across the system
   - Verify database connectivity and permissions

6. **Database migration issues**:
   - Run migrations manually: `npx nx run twenty-server:database:migrate`
   - Check that the `isSuperAdmin` column exists in the `core.user` table
   - Verify WorkspaceActivationStatus enum is properly exported

### Development Commands

```bash
# Run database migrations
npx nx run twenty-server:database:migrate

# Regenerate GraphQL types
npx nx run twenty-front:graphql:generate

# Start development server
npm start

# Check running processes
ps aux | grep -i twenty
```

## API Reference

### Workspace Management Endpoints

```graphql
# Queries
workspaces: [Workspace!]!
workspace(workspaceId: String!): Workspace
searchWorkspaces(searchTerm: String!): [Workspace!]!

# Mutations  
createWorkspace(data: CreateWorkspaceInput!): Workspace!
updateWorkspace(workspaceId: String!, data: UpdateWorkspaceInput!): Workspace!
activateWorkspace(workspaceId: String!): Workspace!
deactivateWorkspace(workspaceId: String!): Workspace!
deleteWorkspace(workspaceId: String!): Workspace!
```

### User Management Endpoints

```graphql
# Queries
users: [User!]!
user(userId: String!): User
searchUsers(searchTerm: String!): [User!]!

# Mutations
disableUser(userId: String!): User!
enableUser(userId: String!): User!
promoteToSuperAdmin(userId: String!): User!
revokeAdminAccess(userId: String!): User!
```

## Future Enhancements

Potential future improvements for the super admin feature:

### Workspace Management
- Advanced workspace filtering and search functionality
- Bulk workspace operations (batch activate/deactivate)
- Workspace analytics and usage metrics
- Workspace templates for standardized setups
- Workspace backup and restore capabilities

### User Management
- Advanced user filtering and search
- Bulk user operations (batch enable/disable)
- User role management interface
- User activity monitoring and audit logs
- Password reset and account management tools

### System Administration
- System-wide configuration management
- Enhanced audit logging for super admin actions
- Email notification system for admin actions
- API rate limiting and monitoring
- System health and performance dashboards

---

**Note**: This feature is designed for system administrators and should be used with caution. Super admin privileges provide access to sensitive system-wide data and operations. 