import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { SuperAdminTokenService } from 'src/engine/core-modules/auth/token/services/super-admin-token.service';
import { SuperAdminAuditService } from 'src/engine/core-modules/audit/super-admin-audit.service';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';

// DTOs
class SuperAdminTokenDto {
  accessToken: string;
  refreshToken: string;
}

@UsePipes(ResolverValidationPipe)
@Resolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class SuperAdminManagementResolver {
  constructor(
    private readonly superAdminTokenService: SuperAdminTokenService,
    private readonly superAdminAuditService: SuperAdminAuditService,
  ) {}

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Mutation(() => SuperAdminTokenDto)
  async generateSuperAdminToken(
    @Args('workspaceId', { type: () => String, nullable: true })
    workspaceId?: string,
    @AuthUser() user?: User,
  ): Promise<SuperAdminTokenDto> {
    // Verify user is eligible for super admin token
    if (!user?.canAccessFullAdminPanel) {
      throw new Error('User not authorized to generate super admin tokens');
    }

    // Log the token generation
    await this.superAdminAuditService.logSuperAdminAction({
      userId: user.id,
      userEmail: user.email,
      action: 'GENERATE_SUPER_ADMIN_TOKEN',
      workspaceId,
      targetResource: 'super_admin_token',
      metadata: { requestedWorkspaceId: workspaceId },
      severity: 'CRITICAL',
    });

    const tokens = await this.superAdminTokenService.generateSuperAdminToken(
      user.id,
      workspaceId,
    );

    return tokens;
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => String)
  async getSuperAdminAuditLogs(
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 100 })
    limit: number,
    @AuthUser() user?: User,
  ): Promise<string> {
    if (!user?.canAccessFullAdminPanel) {
      throw new Error('User not authorized to view audit logs');
    }

    const logs = await this.superAdminAuditService.getAuditLogs({ limit });

    return JSON.stringify(logs, null, 2);
  }
}
