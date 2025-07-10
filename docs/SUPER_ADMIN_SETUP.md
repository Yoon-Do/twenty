# Super Admin Setup Guide

This guide explains how to set up super admin accounts in Twenty CRM to access the super admin features like the workspaces management interface.

## Overview

The super admin feature allows designated users to:
- View all workspaces in the system
- Access workspace management functionality  
- Monitor system-wide activities

## Implementation Status

✅ **Backend Implementation (Complete)**
- Added `isSuperAdmin` field to User entity
- Created database migration for `isSuperAdmin` column
- Implemented `SuperAdminGuard` to protect admin endpoints
- Created `AdminModule` with `AdminResolver` and `AdminService`
- Added GraphQL `workspaces` query for super admins

✅ **Frontend Implementation (Complete)**
- Created admin workspaces list page (`AdminWorkspacesList`)
- Added routing for `/admin/workspaces` page
- Updated navigation to show "Workspaces" sub-item for super admins
- Updated GraphQL fragments and types to include `isSuperAdmin`
- Updated admin access logic to include super admin users

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

2. **Test the GraphQL endpoint** (after logging in as the super admin user):
```graphql
query GetWorkspaces {
  workspaces {
    id
    displayName
    subdomain
    createdAt
    activationStatus
  }
}
```

### 3. Testing the UI

1. **Start the development server:**
```bash
npm start
```

2. **Login** with the super admin user account

3. **Navigate to Settings** → **Admin Panel** → **Workspaces**

4. **Verify** that you can see:
   - A list of all workspaces in the system
   - Workspace details like name, subdomain, creation date, and status
   - The "Workspaces" sub-menu item under Admin Panel (only visible to super admins)

## Architecture Details

### Backend Components

- **User Entity**: `packages/twenty-server/src/engine/core-modules/user/user.entity.ts`
- **Migration**: `packages/twenty-server/src/database/typeorm/core/migrations/common/1752140524000-addIsSuperAdminToUser.ts`
- **Guard**: `packages/twenty-server/src/engine/guards/super-admin.guard.ts`
- **Admin Module**: `packages/twenty-server/src/engine/core-modules/admin/`

### Frontend Components

- **Admin Workspaces List**: `packages/twenty-front/src/modules/admin/components/AdminWorkspacesList.tsx`
- **Admin Page**: `packages/twenty-front/src/pages/settings/admin/SettingsAdminWorkspaces.tsx`  
- **GraphQL Query**: `packages/twenty-front/src/modules/admin/graphql/queries/getWorkspaces.ts`
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

## Troubleshooting

### Common Issues

1. **"Workspaces" menu not visible**: 
   - Verify the user has `isSuperAdmin = true` in the database
   - Clear browser cache and refresh
   - Check the browser console for any JavaScript errors

2. **GraphQL permission errors**:
   - Ensure the `SuperAdminGuard` is properly applied to the resolver
   - Verify that the user's session includes the updated `isSuperAdmin` field

3. **Database migration issues**:
   - Run migrations manually: `npx nx run twenty-server:database:migrate`
   - Check that the `isSuperAdmin` column exists in the `core.user` table

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

## Future Enhancements

Potential future improvements for the super admin feature:

- Advanced workspace filtering and search
- Bulk workspace management operations
- Workspace analytics and metrics
- System-wide configuration management
- Enhanced audit logging for super admin actions

---

**Note**: This feature is designed for system administrators and should be used with caution. Super admin privileges provide access to sensitive system-wide data and operations. 