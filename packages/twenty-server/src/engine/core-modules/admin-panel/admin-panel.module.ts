import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { AdminPanelResolver } from 'src/engine/core-modules/admin-panel/admin-panel.resolver';
import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { CrossWorkspaceAdminService } from 'src/engine/core-modules/admin-panel/cross-workspace-admin.service';
import { CrossWorkspaceAdminResolver } from 'src/engine/core-modules/admin-panel/cross-workspace-admin.resolver';
import { EnhancedImpersonateService } from 'src/engine/core-modules/admin-panel/enhanced-impersonate.service';
import { SuperAdminManagementResolver } from 'src/engine/core-modules/admin-panel/super-admin-management.resolver';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { SuperAdminAuditService } from 'src/engine/core-modules/audit/super-admin-audit.service';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SuperAdminPermissionsService } from 'src/engine/metadata-modules/permissions/super-admin-permissions.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserWorkspace, Workspace], 'core'),
    AuthModule,
    TokenModule,
    DomainManagerModule,
    HealthModule,
    RedisClientModule,
    TerminusModule,
    FeatureFlagModule,
    PermissionsModule,
  ],
  providers: [
    AdminPanelResolver,
    AdminPanelService,
    AdminPanelHealthService,
    CrossWorkspaceAdminResolver,
    CrossWorkspaceAdminService,
    EnhancedImpersonateService,
    SuperAdminManagementResolver,
    SuperAdminAuditService,
    SuperAdminPermissionsService,
  ],
  exports: [
    AdminPanelService,
    CrossWorkspaceAdminService,
    SuperAdminAuditService,
    SuperAdminPermissionsService,
  ],
})
export class AdminPanelModule {}
