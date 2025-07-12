import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { SuperAdminTokenService } from 'src/engine/core-modules/auth/token/services/super-admin-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { SuperAdminAuditService } from 'src/engine/core-modules/audit/super-admin-audit.service';

@Injectable()
export class EnhancedImpersonateService {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly loginTokenService: LoginTokenService,
    private readonly superAdminTokenService: SuperAdminTokenService,
    private readonly domainManagerService: DomainManagerService,
    private readonly superAdminAuditService: SuperAdminAuditService,
  ) {}

  async impersonate(
    userId: string,
    workspaceId: string,
    requestingUser: User,
    isSuperAdmin = false,
  ) {
    // Super admin can impersonate anyone in any workspace
    if (isSuperAdmin && requestingUser.canAccessFullAdminPanel) {
      return await this.superAdminImpersonate(
        userId,
        workspaceId,
        requestingUser,
      );
    }

    // Regular impersonation logic (existing)
    return await this.regularImpersonate(userId, workspaceId);
  }

  private async superAdminImpersonate(
    userId: string,
    workspaceId: string,
    requestingUser: User,
  ) {
    // Find target user
    const targetUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    userValidator.assertIsDefinedOrThrow(
      targetUser,
      new AuthException(
        'Target user not found',
        AuthExceptionCode.INVALID_INPUT,
      ),
    );

    // Find target workspace
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    // Check if target user has access to workspace
    let userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId: targetUser.id,
        workspaceId: workspace.id,
      },
    });

    // If user doesn't have access, temporarily add them (super admin power)
    if (!userWorkspace) {
      userWorkspace = await this.userWorkspaceRepository.save({
        userId: targetUser.id,
        workspaceId: workspace.id,
      });
    }

    // Log the super admin impersonation
    await this.superAdminAuditService.logSuperAdminAction({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      action: 'SUPER_ADMIN_IMPERSONATE',
      workspaceId,
      workspaceName: workspace.displayName,
      targetResource: 'user_impersonation',
      metadata: {
        targetUserId: userId,
        targetUserEmail: targetUser.email,
        temporaryAccess: !userWorkspace,
      },
      severity: 'CRITICAL',
    });

    // Generate login token for target user in target workspace
    const loginToken = await this.loginTokenService.generateLoginToken(
      targetUser.email,
      workspace.id,
    );

    return {
      workspace: {
        id: workspace.id,
        workspaceUrls: this.domainManagerService.getWorkspaceUrls(workspace),
      },
      loginToken,
    };
  }

  private async regularImpersonate(userId: string, workspaceId: string) {
    // Original impersonation logic
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        workspaces: {
          workspaceId,
          workspace: {
            allowImpersonation: true,
          },
        },
      },
      relations: ['workspaces', 'workspaces.workspace'],
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException(
        'User not found or impersonation not enabled on workspace',
        AuthExceptionCode.INVALID_INPUT,
      ),
    );

    const loginToken = await this.loginTokenService.generateLoginToken(
      user.email,
      user.workspaces[0].workspace.id,
    );

    return {
      workspace: {
        id: user.workspaces[0].workspace.id,
        workspaceUrls: this.domainManagerService.getWorkspaceUrls(
          user.workspaces[0].workspace,
        ),
      },
      loginToken,
    };
  }
}
