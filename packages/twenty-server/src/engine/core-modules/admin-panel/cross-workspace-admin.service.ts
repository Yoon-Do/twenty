import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { SuperAdminTokenService } from 'src/engine/core-modules/auth/token/services/super-admin-token.service';
import { SuperAdminAuditService } from 'src/engine/core-modules/audit/super-admin-audit.service';

interface WorkspaceSummary {
  id: string;
  name: string;
  subdomain?: string;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
  activationStatus: string;
  isActive: boolean;
}

@Injectable()
export class CrossWorkspaceAdminService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly superAdminTokenService: SuperAdminTokenService,
    private readonly superAdminAuditService: SuperAdminAuditService,
    // private readonly dataSourceService: DataSourceService,
  ) {}

  async getAllWorkspacesSummary(): Promise<WorkspaceSummary[]> {
    const workspaces = await this.workspaceRepository.find({
      relations: ['workspaceUsers'],
      order: { createdAt: 'DESC' },
    });

    return workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.displayName || workspace.subdomain || 'Unnamed Workspace',
      subdomain: workspace.subdomain,
      userCount: workspace.workspaceUsers?.length || 0,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      activationStatus: workspace.activationStatus || 'unknown',
      isActive: workspace.activationStatus === 'ACTIVE',
    }));
  }

  async getWorkspaceDetails(
    workspaceId: string,
  ): Promise<Record<string, unknown>> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['workspaceUsers', 'workspaceUsers.user'],
    });

    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    return {
      ...workspace,
      users: workspace.workspaceUsers.map((uw) => ({
        id: uw.user.id,
        email: uw.user.email,
        firstName: uw.user.firstName,
        lastName: uw.user.lastName,
        joinedAt: uw.createdAt,
      })),
    };
  }

  async generateWorkspaceAccessToken(
    adminUserId: string,
    workspaceId: string,
    requestingUser: User,
  ): Promise<string> {
    // Verify requesting user is super admin
    if (!requestingUser.canAccessFullAdminPanel) {
      throw new Error('Not authorized to generate workspace access tokens');
    }

    // Generate super admin token for specific workspace
    const tokens = await this.superAdminTokenService.generateSuperAdminToken(
      adminUserId,
      workspaceId,
    );

    // Log the action
    await this.superAdminAuditService.logSuperAdminAction({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      action: 'GENERATE_WORKSPACE_ACCESS_TOKEN',
      workspaceId,
      targetResource: 'workspace_access_token',
      metadata: { adminUserId },
      severity: 'HIGH',
    });

    return tokens.accessToken;
  }

  async addAdminToWorkspace(
    adminUserId: string,
    targetWorkspaceId: string,
    requestingUser: User,
  ): Promise<void> {
    // Verify requesting user is super admin
    if (!requestingUser.canAccessFullAdminPanel) {
      throw new Error('Not authorized to add admins to workspaces');
    }

    // Verify target workspace exists
    const workspace = await this.workspaceRepository.findOneBy({
      id: targetWorkspaceId,
    });

    if (!workspace) {
      throw new Error(`Workspace ${targetWorkspaceId} not found`);
    }

    // Verify admin user exists
    const adminUser = await this.userRepository.findOneBy({
      id: adminUserId,
    });

    if (!adminUser) {
      throw new Error(`User ${adminUserId} not found`);
    }

    // Check if user already has access to workspace
    const existingUserWorkspace = await this.userWorkspaceRepository.findOneBy({
      userId: adminUserId,
      workspaceId: targetWorkspaceId,
    });

    if (!existingUserWorkspace) {
      // Add user to workspace
      await this.userWorkspaceRepository.save({
        userId: adminUserId,
        workspaceId: targetWorkspaceId,
        // Add any additional fields needed for admin role
      });
    }

    // Log the action
    await this.superAdminAuditService.logSuperAdminAction({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      action: 'ADD_ADMIN_TO_WORKSPACE',
      workspaceId: targetWorkspaceId,
      workspaceName: workspace?.displayName,
      targetResource: 'workspace_membership',
      metadata: { adminUserId, targetWorkspaceId },
      severity: 'HIGH',
    });
  }

  async getWorkspaceData(
    workspaceId: string,
    entityName: string,
    requestingUser: User,
    options: {
      limit?: number;
      offset?: number;
      filters?: Record<string, unknown>;
    } = {},
  ): Promise<Record<string, unknown>> {
    // Verify requesting user is super admin
    if (!requestingUser.canAccessFullAdminPanel) {
      throw new Error('Not authorized to access workspace data');
    }

    // Verify workspace exists
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    // Log the action
    await this.superAdminAuditService.logSuperAdminAction({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      action: 'ACCESS_WORKSPACE_DATA',
      workspaceId,
      workspaceName: workspace.displayName,
      targetResource: entityName,
      metadata: { entityName, options },
      severity: 'MEDIUM',
    });

    // TODO: Implement workspace schema data access
    // This would require connecting to the workspace-specific schema
    // and querying the requested entity with the provided filters

    // Placeholder implementation
    return {
      workspaceId,
      entityName,
      data: [],
      total: 0,
      message: 'Direct workspace data access not yet implemented',
    };
  }

  async executeWorkspaceQuery(
    workspaceId: string,
    query: string,
    requestingUser: User,
  ): Promise<Record<string, unknown>> {
    // Verify requesting user is super admin
    if (!requestingUser.canAccessFullAdminPanel) {
      throw new Error('Not authorized to execute workspace queries');
    }

    // Log the action
    await this.superAdminAuditService.logSuperAdminAction({
      userId: requestingUser.id,
      userEmail: requestingUser.email,
      action: 'EXECUTE_WORKSPACE_QUERY',
      workspaceId,
      targetResource: 'workspace_database',
      metadata: { query },
      severity: 'CRITICAL',
    });

    // TODO: Implement safe query execution
    // This should include query validation, sanitization, and execution limits

    throw new Error(
      'Direct query execution not yet implemented for security reasons',
    );
  }
}
