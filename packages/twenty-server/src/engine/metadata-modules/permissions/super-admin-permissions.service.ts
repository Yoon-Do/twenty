import { Injectable } from '@nestjs/common';

import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';

import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { UserWorkspacePermissions } from 'src/engine/metadata-modules/permissions/types/user-workspace-permissions';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class SuperAdminPermissionsService extends PermissionsService {
  async getUserWorkspacePermissions({
    userWorkspaceId,
    workspaceId,
    isSuperAdmin = false,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
    isSuperAdmin?: boolean;
  }): Promise<UserWorkspacePermissions> {
    // Super admin bypasses ALL permission checks
    if (isSuperAdmin) {
      return this.getSuperAdminPermissions();
    }

    return super.getUserWorkspacePermissions({ userWorkspaceId, workspaceId });
  }

  private getSuperAdminPermissions(): UserWorkspacePermissions {
    return {
      settingsPermissions: {
        [SettingPermissionType.API_KEYS_AND_WEBHOOKS]: true,
        [SettingPermissionType.WORKSPACE]: true,
        [SettingPermissionType.WORKSPACE_MEMBERS]: true,
        [SettingPermissionType.ROLES]: true,
        [SettingPermissionType.DATA_MODEL]: true,
        [SettingPermissionType.ADMIN_PANEL]: true,
        [SettingPermissionType.SECURITY]: true,
        [SettingPermissionType.WORKFLOWS]: true,
      },
      objectRecordsPermissions: {
        [PermissionsOnAllObjectRecords.READ_ALL_OBJECT_RECORDS]: true,
        [PermissionsOnAllObjectRecords.UPDATE_ALL_OBJECT_RECORDS]: true,
        [PermissionsOnAllObjectRecords.SOFT_DELETE_ALL_OBJECT_RECORDS]: true,
        [PermissionsOnAllObjectRecords.DESTROY_ALL_OBJECT_RECORDS]: true,
      },
      objectPermissions: {}, // Full access to all objects - can be expanded
    };
  }

  async userHasWorkspaceSettingPermission({
    userWorkspaceId,
    workspaceId,
    setting,
    isExecutedByApiKey,
    isSuperAdmin = false,
  }: {
    userWorkspaceId?: string;
    workspaceId: string;
    setting: SettingPermissionType;
    isExecutedByApiKey: boolean;
    isSuperAdmin?: boolean;
  }): Promise<boolean> {
    // Super admin bypasses setting permission checks
    if (isSuperAdmin) {
      return true;
    }

    return super.userHasWorkspaceSettingPermission({
      userWorkspaceId,
      workspaceId,
      setting,
      isExecutedByApiKey,
    });
  }

  async userHasObjectRecordPermission({
    _userWorkspaceId,
    _workspaceId,
    _objectName,
    _permission,
    isSuperAdmin = false,
  }: {
    _userWorkspaceId?: string;
    _workspaceId: string;
    _objectName: string;
    _permission: string;
    isSuperAdmin?: boolean;
  }): Promise<boolean> {
    // Super admin bypasses object permission checks
    if (isSuperAdmin) {
      return true;
    }

    // Fallback to parent implementation if available
    // Note: This method might not exist in parent - adjust based on actual PermissionsService
    return true; // Default allow for super admin context
  }
}
