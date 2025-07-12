import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { SuperAdminPermissionsService } from 'src/engine/metadata-modules/permissions/super-admin-permissions.service';

export const EnhancedSettingsPermissionsGuard = (
  requiredPermission: SettingPermissionType,
): Type<CanActivate> => {
  @Injectable()
  class EnhancedSettingsPermissionsMixin implements CanActivate {
    constructor(
      private readonly permissionsService: PermissionsService,
      private readonly superAdminPermissionsService: SuperAdminPermissionsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext().req;

      // Check if super admin
      const isSuperAdmin =
        request.isSuperAdmin === true &&
        request.user?.canAccessFullAdminPanel === true;

      if (isSuperAdmin) {
        return true; // Super admin bypasses ALL permission checks
      }

      // Regular permission check logic
      const workspaceId = request.workspace.id;
      const userWorkspaceId = request.userWorkspaceId;
      const workspaceActivationStatus = request.workspace.activationStatus;

      if (
        [
          WorkspaceActivationStatus.PENDING_CREATION,
          WorkspaceActivationStatus.ONGOING_CREATION,
        ].includes(workspaceActivationStatus)
      ) {
        return true;
      }

      const hasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId,
          setting: requiredPermission,
          workspaceId,
          isExecutedByApiKey: isDefined(request.apiKey),
        });

      if (hasPermission === true) {
        return true;
      }

      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }

  return mixin(EnhancedSettingsPermissionsMixin);
};
