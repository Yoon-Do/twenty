# Hướng dẫn Super Admin Twenty - Hướng dẫn toàn diện

## Tổng quan

Twenty không có khái niệm "super admin" toàn cục như các hệ thống khác. Thay vào đó, Twenty sử dụng mô hình **workspace-based permissions** với các role cụ thể. Tuy nhiên, có thể tạo user có quyền admin trên tất cả workspace thông qua các cách khác nhau.

## 1. Setup Super Admin User

### 1.1 Tạo User Mới Làm Admin

```sql
-- Bước 1: Tạo user mới trong core.users
INSERT INTO core.users (
    id, email, "firstName", "lastName", "defaultAvatarUrl", 
    "createdAt", "updatedAt", "deletedAt"
) VALUES (
    gen_random_uuid(), 
    'superadmin@company.com', 
    'Super', 
    'Admin', 
    NULL,
    NOW(), 
    NOW(), 
    NULL
);

-- Lấy user ID vừa tạo
SELECT id FROM core.users WHERE email = 'superadmin@company.com';
```

### 1.2 Liên kết User với Workspace

```sql
-- Bước 2: Liên kết user với workspace (lặp lại cho mỗi workspace)
INSERT INTO core."userWorkspace" (
    id, "userId", "workspaceId", "defaultAvatarUrl", 
    locale, "createdAt", "updatedAt", "deletedAt"
) VALUES (
    gen_random_uuid(),
    'USER_ID_FROM_STEP_1',
    'WORKSPACE_ID',
    NULL,
    'en',
    NOW(),
    NOW(),
    NULL
);

-- Lấy userWorkspace ID
SELECT id FROM core."userWorkspace" 
WHERE "userId" = 'USER_ID_FROM_STEP_1' 
AND "workspaceId" = 'WORKSPACE_ID';
```

### 1.3 Gán Role Admin cho User

```sql
-- Bước 3: Lấy role Admin của workspace
SELECT id FROM core.role 
WHERE "workspaceId" = 'WORKSPACE_ID' 
AND label = 'Admin';

-- Bước 4: Gán role Admin cho user trong workspace
INSERT INTO core."roleTargets" (
    id, "workspaceId", "roleId", "userWorkspaceId", 
    "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'WORKSPACE_ID',
    'ADMIN_ROLE_ID_FROM_STEP_3',
    'USER_WORKSPACE_ID_FROM_STEP_2',
    NOW(),
    NOW()
);
```

## 2. Database Operations - Các thao tác SQL thường dùng

### 2.1 Kiểm tra quyền của user trong workspace

```sql
-- Kiểm tra role của user trong workspace
SELECT 
    u.email,
    w."displayName" as workspace_name,
    r.label as role_name,
    r."canUpdateAllSettings",
    r."canReadAllObjectRecords",
    r."canUpdateAllObjectRecords",
    r."canSoftDeleteAllObjectRecords",
    r."canDestroyAllObjectRecords"
FROM core.users u
JOIN core."userWorkspace" uw ON u.id = uw."userId"
JOIN core."roleTargets" rt ON uw.id = rt."userWorkspaceId"
JOIN core.role r ON rt."roleId" = r.id
JOIN core.workspace w ON uw."workspaceId" = w.id
WHERE u.email = 'superadmin@company.com'
ORDER BY w."displayName";
```

### 2.2 Cập nhật user thành admin cho tất cả workspace

```sql
-- Tạo function để set user làm admin cho tất cả workspace
CREATE OR REPLACE FUNCTION set_user_as_admin_all_workspaces(user_email TEXT)
RETURNS TABLE(workspace_name TEXT, role_assigned BOOLEAN) AS $$
DECLARE
    target_user_id UUID;
    user_ws_id UUID;
    admin_role_id UUID;
    ws RECORD;
BEGIN
    -- Lấy user ID
    SELECT id INTO target_user_id FROM core.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;
    
    -- Lặp qua tất cả workspace
    FOR ws IN SELECT * FROM core.workspace WHERE "deletedAt" IS NULL LOOP
        -- Tạo userWorkspace nếu chưa tồn tại
        INSERT INTO core."userWorkspace" ("userId", "workspaceId", locale)
        VALUES (target_user_id, ws.id, 'en')
        ON CONFLICT ("userId", "workspaceId") DO NOTHING
        RETURNING id INTO user_ws_id;
        
        IF user_ws_id IS NULL THEN
            SELECT id INTO user_ws_id 
            FROM core."userWorkspace" 
            WHERE "userId" = target_user_id AND "workspaceId" = ws.id;
        END IF;
        
        -- Lấy admin role ID
        SELECT id INTO admin_role_id 
        FROM core.role 
        WHERE "workspaceId" = ws.id AND label = 'Admin';
        
        IF admin_role_id IS NOT NULL THEN
            -- Xóa role cũ nếu có
            DELETE FROM core."roleTargets" 
            WHERE "userWorkspaceId" = user_ws_id AND "workspaceId" = ws.id;
            
            -- Gán admin role
            INSERT INTO core."roleTargets" ("workspaceId", "roleId", "userWorkspaceId")
            VALUES (ws.id, admin_role_id, user_ws_id);
            
            workspace_name := ws."displayName";
            role_assigned := TRUE;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Sử dụng function
SELECT * FROM set_user_as_admin_all_workspaces('superadmin@company.com');
```

### 2.3 Kiểm tra workspace access của user

```sql
-- Liệt kê tất cả workspace mà user có access
SELECT 
    w.id as workspace_id,
    w."displayName" as workspace_name,
    w.subdomain,
    w."customDomain",
    w."activationStatus",
    r.label as role,
    CASE 
        WHEN r."canUpdateAllSettings" = true THEN 'Admin'
        WHEN r."canReadAllObjectRecords" = true THEN 'Member'
        ELSE 'Limited'
    END as access_level
FROM core.users u
JOIN core."userWorkspace" uw ON u.id = uw."userId"
JOIN core.workspace w ON uw."workspaceId" = w.id
LEFT JOIN core."roleTargets" rt ON uw.id = rt."userWorkspaceId"
LEFT JOIN core.role r ON rt."roleId" = r.id
WHERE u.email = 'superadmin@company.com'
AND w."deletedAt" IS NULL
ORDER BY w."displayName";
```

## 3. Troubleshooting Guide

### 3.1 Lỗi "User not found or impersonation not enable on workspace"

**Nguyên nhân**: Workspace không cho phép impersonation hoặc user không tồn tại.

**Cách fix**:
```sql
-- Bật impersonation cho workspace
UPDATE core.workspace 
SET "allowImpersonation" = true 
WHERE id = 'WORKSPACE_ID';

-- Hoặc kiểm tra user tồn tại
SELECT * FROM core.users WHERE email = 'superadmin@company.com';
```

### 3.2 Lỗi "No role found for userWorkspace"

**Nguyên nhân**: User chưa được gán role trong workspace.

**Cách fix**:
```sql
-- Kiểm tra userWorkspace tồn tại
SELECT * FROM core."userWorkspace" 
WHERE "userId" = 'USER_ID' AND "workspaceId" = 'WORKSPACE_ID';

-- Kiểm tra role tồn tại
SELECT * FROM core.role WHERE "workspaceId" = 'WORKSPACE_ID';

-- Gán role mặc định nếu chưa có
INSERT INTO core."roleTargets" ("workspaceId", "roleId", "userWorkspaceId")
SELECT 'WORKSPACE_ID', r.id, uw.id
FROM core.role r, core."userWorkspace" uw
WHERE r."workspaceId" = 'WORKSPACE_ID' 
AND r.label = 'Admin'
AND uw."userId" = 'USER_ID' 
AND uw."workspaceId" = 'WORKSPACE_ID'
AND NOT EXISTS (
    SELECT 1 FROM core."roleTargets" 
    WHERE "userWorkspaceId" = uw.id
);
```

### 3.3 Lỗi "Cannot unassign last admin"

**Nguyên nhân**: Đang cố gắng xóa admin cuối cùng của workspace.

**Cách fix**:
```sql
-- Kiểm tra số lượng admin trong workspace
SELECT COUNT(*) as admin_count
FROM core."userWorkspace" uw
JOIN core."roleTargets" rt ON uw.id = rt."userWorkspaceId"
JOIN core.role r ON rt."roleId" = r.id
WHERE uw."workspaceId" = 'WORKSPACE_ID' 
AND r.label = 'Admin';

-- Tạo thêm admin tạm thời nếu cần
-- (Thực hiện các bước tạo user và gán role như ở trên)
```

### 3.4 Lỗi "User workspace not found"

**Nguyên nhân**: User chưa được thêm vào workspace.

**Cách fix**:
```sql
-- Thêm user vào workspace
INSERT INTO core."userWorkspace" ("userId", "workspaceId", locale)
SELECT u.id, w.id, 'en'
FROM core.users u, core.workspace w
WHERE u.email = 'superadmin@company.com'
AND w.id = 'WORKSPACE_ID'
AND NOT EXISTS (
    SELECT 1 FROM core."userWorkspace" 
    WHERE "userId" = u.id AND "workspaceId" = w.id
);
```

## 4. Cross-Workspace Access

### 4.1 Tạo super admin có access tất cả workspace

```sql
-- Tạo procedure để thêm super admin vào tất cả workspace
CREATE OR REPLACE FUNCTION create_super_admin(
    admin_email TEXT,
    admin_first_name TEXT DEFAULT 'Super',
    admin_last_name TEXT DEFAULT 'Admin'
) RETURNS TABLE(workspace_count INTEGER, admin_user_id UUID) AS $$
DECLARE
    new_user_id UUID;
    ws RECORD;
    user_ws_id UUID;
    admin_role_id UUID;
    total_workspaces INTEGER := 0;
BEGIN
    -- Tạo hoặc lấy user
    SELECT id INTO new_user_id FROM core.users WHERE email = admin_email;
    
    IF NOT FOUND THEN
        INSERT INTO core.users (email, "firstName", "lastName", locale)
        VALUES (admin_email, admin_first_name, admin_last_name, 'en')
        RETURNING id INTO new_user_id;
    END IF;
    
    -- Lặp qua tất cả workspace
    FOR ws IN SELECT * FROM core.workspace WHERE "deletedAt" IS NULL LOOP
        -- Thêm vào userWorkspace nếu chưa có
        INSERT INTO core."userWorkspace" ("userId", "workspaceId", locale)
        VALUES (new_user_id, ws.id, 'en')
        ON CONFLICT ("userId", "workspaceId") DO NOTHING
        RETURNING id INTO user_ws_id;
        
        IF user_ws_id IS NULL THEN
            SELECT id INTO user_ws_id 
            FROM core."userWorkspace" 
            WHERE "userId" = new_user_id AND "workspaceId" = ws.id;
        END IF;
        
        -- Lấy admin role
        SELECT id INTO admin_role_id 
        FROM core.role 
        WHERE "workspaceId" = ws.id AND label = 'Admin';
        
        IF admin_role_id IS NOT NULL THEN
            -- Xóa role cũ
            DELETE FROM core."roleTargets" 
            WHERE "userWorkspaceId" = user_ws_id AND "workspaceId" = ws.id;
            
            -- Gán admin role
            INSERT INTO core."roleTargets" ("workspaceId", "roleId", "userWorkspaceId")
            VALUES (ws.id, admin_role_id, user_ws_id);
            
            total_workspaces := total_workspaces + 1;
        END IF;
    END LOOP;
    
    workspace_count := total_workspaces;
    admin_user_id := new_user_id;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Sử dụng
SELECT * FROM create_super_admin('superadmin@company.com', 'System', 'Administrator');
```

### 4.2 Kiểm tra cross-workspace access

```sql
-- View để kiểm tra super admin access
CREATE OR REPLACE VIEW super_admin_access AS
SELECT 
    u.id as user_id,
    u.email,
    u."firstName",
    u."lastName",
    w.id as workspace_id,
    w."displayName" as workspace_name,
    w.subdomain,
    w."customDomain",
    r.label as role,
    r."canUpdateAllSettings" as is_admin,
    rt."createdAt" as role_assigned_at
FROM core.users u
JOIN core."userWorkspace" uw ON u.id = uw."userId"
JOIN core.workspace w ON uw."workspaceId" = w.id
JOIN core."roleTargets" rt ON uw.id = rt."userWorkspaceId"
JOIN core.role r ON rt."roleId" = r.id
WHERE w."deletedAt" IS NULL
ORDER BY u.email, w."displayName";

-- Sử dụng view
SELECT * FROM super_admin_access WHERE email = 'superadmin@company.com';
```

## 5. Permission Issues - Debug và Fix

### 5.1 Debug permission của user

```sql
-- Function debug permission chi tiết
CREATE OR REPLACE FUNCTION debug_user_permissions(user_email TEXT)
RETURNS TABLE(
    workspace_name TEXT,
    role_name TEXT,
    can_update_settings BOOLEAN,
    can_read_all BOOLEAN,
    can_update_all BOOLEAN,
    can_soft_delete BOOLEAN,
    can_destroy BOOLEAN,
    permission_issues TEXT[]
) AS $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM core.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;
    
    RETURN QUERY
    SELECT 
        w."displayName",
        r.label,
        r."canUpdateAllSettings",
        r."canReadAllObjectRecords",
        r."canUpdateAllObjectRecords",
        r."canSoftDeleteAllObjectRecords",
        r."canDestroyAllObjectRecords",
        CASE 
            WHEN r."canUpdateAllSettings" = false AND r.label = 'Admin' THEN
                ARRAY['Admin role missing full settings permission']
            WHEN r."canReadAllObjectRecords" = false AND r.label IN ('Admin', 'Member') THEN
                ARRAY['Role missing object read permission']
            ELSE ARRAY[]::TEXT[]
        END
    FROM core.users u
    JOIN core."userWorkspace" uw ON u.id = uw."userId"
    JOIN core.workspace w ON uw."workspaceId" = w.id
    JOIN core."roleTargets" rt ON uw.id = rt."userWorkspaceId"
    JOIN core.role r ON rt."roleId" = r.id
    WHERE u.id = target_user_id
    AND w."deletedAt" IS NULL
    ORDER BY w."displayName";
END;
$$ LANGUAGE plpgsql;

-- Sử dụng
SELECT * FROM debug_user_permissions('superadmin@company.com');
```

### 5.2 Fix permission issues

```sql
-- Cập nhật permission cho role
UPDATE core.role 
SET 
    "canUpdateAllSettings" = true,
    "canReadAllObjectRecords" = true,
    "canUpdateAllObjectRecords" = true,
    "canSoftDeleteAllObjectRecords" = true,
    "canDestroyAllObjectRecords" = true
WHERE "workspaceId" = 'WORKSPACE_ID' 
AND label = 'Admin';

-- Tạo custom super admin role với full permissions
INSERT INTO core.role (
    label, 
    description, 
    "canUpdateAllSettings",
    "canReadAllObjectRecords",
    "canUpdateAllObjectRecords",
    "canSoftDeleteAllObjectRecords",
    "canDestroyAllObjectRecords",
    icon,
    "workspaceId",
    "isEditable"
) VALUES (
    'Super Admin',
    'Full system access',
    true, true, true, true, true,
    'IconCrown',
    'WORKSPACE_ID',
    false
);
```

## 6. User-Workspace Linking Issues

### 6.1 Kiểm tra và fix broken links

```sql
-- Tìm user chưa được link với workspace
SELECT u.email, u.id as user_id
FROM core.users u
WHERE NOT EXISTS (
    SELECT 1 FROM core."userWorkspace" uw 
    WHERE uw."userId" = u.id
);

-- Tìm userWorkspace không có role
SELECT uw.id, u.email, w."displayName"
FROM core."userWorkspace" uw
JOIN core.users u ON uw."userId" = u.id
JOIN core.workspace w ON uw."workspaceId" = w.id
WHERE NOT EXISTS (
    SELECT 1 FROM core."roleTargets" rt 
    WHERE rt."userWorkspaceId" = uw.id
);

-- Auto-fix missing roles
CREATE OR REPLACE FUNCTION fix_missing_roles()
RETURNS INTEGER AS $$
DECLARE
    fixed_count INTEGER := 0;
    missing_record RECORD;
    default_role_id UUID;
BEGIN
    FOR missing_record IN
        SELECT uw.id as user_workspace_id, uw."workspaceId" as workspace_id
        FROM core."userWorkspace" uw
        WHERE NOT EXISTS (
            SELECT 1 FROM core."roleTargets" rt 
            WHERE rt."userWorkspaceId" = uw.id
        )
    LOOP
        -- Lấy default role (Admin nếu có, Member nếu không)
        SELECT id INTO default_role_id
        FROM core.role
        WHERE "workspaceId" = missing_record.workspace_id
        AND label = 'Admin';
        
        IF default_role_id IS NULL THEN
            SELECT id INTO default_role_id
            FROM core.role
            WHERE "workspaceId" = missing_record.workspace_id
            AND label = 'Member';
        END IF;
        
        IF default_role_id IS NOT NULL THEN
            INSERT INTO core."roleTargets" ("workspaceId", "roleId", "userWorkspaceId")
            VALUES (
                missing_record.workspace_id,
                default_role_id,
                missing_record.user_workspace_id
            );
            fixed_count := fixed_count + 1;
        END IF;
    END LOOP;
    
    RETURN fixed_count;
END;
$$ LANGUAGE plpgsql;

-- Sử dụng
SELECT fix_missing_roles();
```

### 6.2 Validate user-workspace relationships

```sql
-- Function validate toàn bộ relationship
CREATE OR REPLACE FUNCTION validate_user_workspace_links()
RETURNS TABLE(
    issue_type TEXT,
    user_email TEXT,
    workspace_name TEXT,
    details TEXT,
    fix_sql TEXT
) AS $$
BEGIN
    -- User không có workspace
    RETURN QUERY
    SELECT 
        'NO_WORKSPACE'::TEXT,
        u.email,
        NULL::TEXT,
        'User has no workspace access',
        format('INSERT INTO core."userWorkspace" ("userId", "workspaceId") SELECT ''%s'', id FROM core.workspace LIMIT 1;', u.id)
    FROM core.users u
    WHERE NOT EXISTS (
        SELECT 1 FROM core."userWorkspace" uw WHERE uw."userId" = u.id
    );
    
    -- UserWorkspace không có role
    RETURN QUERY
    SELECT 
        'NO_ROLE'::TEXT,
        u.email,
        w."displayName",
        'User in workspace but has no role',
        format('INSERT INTO core."roleTargets" ("workspaceId", "roleId", "userWorkspaceId") SELECT ''%s'', id, ''%s'' FROM core.role WHERE "workspaceId" = ''%s'' AND label = ''Member'' LIMIT 1;', w.id, uw.id, w.id)
    FROM core."userWorkspace" uw
    JOIN core.users u ON uw."userId" = u.id
    JOIN core.workspace w ON uw."workspaceId" = w.id
    WHERE NOT EXISTS (
        SELECT 1 FROM core."roleTargets" rt WHERE rt."userWorkspaceId" = uw.id
    );
    
    -- Role không tồn tại
    RETURN QUERY
    SELECT 
        'INVALID_ROLE'::TEXT,
        u.email,
        w."displayName",
        'User has role assignment but role does not exist',
        format('DELETE FROM core."roleTargets" WHERE "userWorkspaceId" = ''%s'';', uw.id)
    FROM core."userWorkspace" uw
    JOIN core.users u ON uw."userId" = u.id
    JOIN core.workspace w ON uw."workspaceId" = w.id
    JOIN core."roleTargets" rt ON uw.id = rt."userWorkspaceId"
    WHERE NOT EXISTS (
        SELECT 1 FROM core.role r WHERE r.id = rt."roleId"
    );
END;
$$ LANGUAGE plpgsql;

-- Sử dụng
SELECT * FROM validate_user_workspace_links();
```

## 7. Best Practices cho Super Admin Management

### 7.1 Security Best Practices

```sql
-- Tạo audit log cho super admin actions
CREATE TABLE IF NOT EXISTS super_admin_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_user_email TEXT,
    target_workspace_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function log super admin actions
CREATE OR REPLACE FUNCTION log_super_admin_action(
    admin_email TEXT,
    action TEXT,
    target_user TEXT DEFAULT NULL,
    target_workspace UUID DEFAULT NULL,
    details JSONB DEFAULT '{}'::JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO super_admin_audit (admin_email, action, target_user_email, target_workspace_id, details)
    VALUES (admin_email, action, target_user, target_workspace, details);
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Monitoring và Alerting

```sql
-- View monitor super admin activities
CREATE OR REPLACE VIEW super_admin_monitoring AS
SELECT 
    u.email as admin_email,
    w."displayName" as workspace_name,
    r.label as role,
    rt."createdAt" as role_assigned_at,
    COUNT(*) OVER (PARTITION BY u.id) as total_workspaces
FROM core.users u
JOIN core."userWorkspace" uw ON u.id = uw."userId"
JOIN core.workspace w ON uw."workspaceId" = w.id
JOIN core."roleTargets" rt ON uw.id = rt."userWorkspaceId"
JOIN core.role r ON rt."roleId" = r.id
WHERE r.label IN ('Admin', 'Super Admin')
AND r."canUpdateAllSettings" = true
ORDER BY u.email, w."displayName";

-- Alert khi có super admin mới được tạo
CREATE OR REPLACE FUNCTION alert_new_super_admin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."canUpdateAllSettings" = true AND NEW.label = 'Admin' THEN
        -- Gửi notification (có thể integrate với email/webhook)
        RAISE NOTICE 'New admin role created: % in workspace %', NEW.label, NEW."workspaceId";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 7.3 Backup và Recovery

```sql
-- Backup super admin configuration
CREATE OR REPLACE FUNCTION backup_super_admin_config()
RETURNS TABLE(backup_data JSON) AS $$
BEGIN
    RETURN QUERY
    SELECT json_build_object(
        'timestamp', NOW(),
        'super_admins', json_agg(
            json_build_object(
                'email', u.email,
                'workspaces', json_agg(
                    json_build_object(
                        'name', w."displayName",
                        'role', r.label,
                        'permissions', json_build_object(
                            'can_update_settings', r."canUpdateAllSettings",
                            'can_read_all', r."canReadAllObjectRecords",
                            'can_update_all', r."canUpdateAllObjectRecords",
                            'can_soft_delete', r."canSoftDeleteAllObjectRecords",
                            'can_destroy', r."canDestroyAllObjectRecords"
                        )
                    )
                )
            )
        )
    )
    FROM core.users u
    JOIN core."userWorkspace" uw ON u.id = uw."userId"
    JOIN core.workspace w ON uw."workspaceId" = w.id
    JOIN core."roleTargets" rt ON uw.id = rt."userWorkspaceId"
    JOIN core.role r ON rt."roleId" = r.id
    WHERE r."canUpdateAllSettings" = true
    GROUP BY u.email;
END;
$$ LANGUAGE plpgsql;
```

### 7.4 Migration Scripts

```bash
#!/bin/bash
# migration-script.sh - Script để migrate super admin giữa các môi trường

# Export super admin config
psql $DATABASE_URL -c "SELECT backup_super_admin_config();" > super_admin_backup.json

# Import super admin config
psql $DATABASE_URL -f restore_super_admin.sql

# Validate sau migration
psql $DATABASE_URL -c "SELECT * FROM validate_user_workspace_links();"
```

## 8. Quick Commands Reference

### 8.1 Check user access
```bash
# Check if user is admin in workspace
psql $DATABASE_URL -c "
SELECT u.email, w.displayName, r.label 
FROM core.users u
JOIN core.userWorkspace uw ON u.id = uw.userId
JOIN core.workspace w ON uw.workspaceId = w.id
JOIN core.roleTargets rt ON uw.id = rt.userWorkspaceId
JOIN core.role r ON rt.roleId = r.id
WHERE u.email = 'admin@company.com' AND w.id = 'workspace-id';
"

# List all workspaces for user
psql $DATABASE_URL -c "
SELECT w.displayName, w.subdomain, r.label as role
FROM core.users u
JOIN core.userWorkspace uw ON u.id = uw.userId
JOIN core.workspace w ON uw.workspaceId = w.id
JOIN core.roleTargets rt ON uw.id = rt.userWorkspaceId
JOIN core.role r ON rt.roleId = r.id
WHERE u.email = 'admin@company.com';
"
```

### 8.2 Reset user permissions
```sql
-- Reset user to admin in all workspaces
SELECT create_super_admin('admin@company.com');

-- Remove user from all workspaces
DELETE FROM core."userWorkspace" 
WHERE "userId" = (SELECT id FROM core.users WHERE email = 'user@company.com');
```

## 9. Testing và Validation

### 9.1 Test super admin access
```bash
# Test API access
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"{ currentUser { email workspaces { id displayName } } }"}'

# Test workspace switching
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"{ workspace(id: \"workspace-id\") { displayName members { edges { node { user { email } role { label } } } } } }"}'
```

### 9.2 Validation checklist
- [ ] User tồn tại trong core.users
- [ ] User có userWorkspace cho mỗi workspace
- [ ] Mỗi userWorkspace có roleTargets
- [ ] Role có đầy đủ permissions
- [ ] Workspace có allowImpersonation = true (nếu cần)

## Tổng kết

Hướng dẫn này cung cấp các cách tiếp cận khác nhau để quản lý super admin trong Twenty:

1. **Workspace-based Admin**: User là admin trong từng workspace riêng biệt
2. **Cross-workspace Admin**: User có quyền admin trong tất cả workspace
3. **Custom Super Admin Role**: Tạo role với permissions tùy chỉnh

Luôn backup trước khi thực hiện các thay đổi và test kỹ trong môi trường development trước khi áp dụng vào production.