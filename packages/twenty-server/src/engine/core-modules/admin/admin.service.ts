import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceActivationStatus } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllWorkspaces(): Promise<Workspace[]> {
    return this.workspaceRepository.find({
      select: {
        id: true,
        displayName: true,
        subdomain: true,
        logo: true,
        activationStatus: true,
        isPublicInviteLinkEnabled: true,
        allowImpersonation: true,
        createdAt: true,
        updatedAt: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isEmailVerified: true,
        disabled: true,
        canImpersonate: true,
        canAccessFullAdminPanel: true,
        isSuperAdmin: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
      relations: {
        workspaces: {
          workspace: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: {
        workspaces: {
          workspace: true,
        },
      },
    });
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('user.firstName ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('user.lastName ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .leftJoinAndSelect('user.workspaces', 'userWorkspaces')
      .leftJoinAndSelect('userWorkspaces.workspace', 'workspace')
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async promoteToSuperAdmin(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.isSuperAdmin = true;
    user.canAccessFullAdminPanel = true;

    return this.userRepository.save(user);
  }

  async revokeAdminAccess(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.isSuperAdmin = false;
    user.canAccessFullAdminPanel = false;
    user.canImpersonate = false;

    return this.userRepository.save(user);
  }

  async disableUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.disabled = true;

    return this.userRepository.save(user);
  }

  async enableUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.disabled = false;

    return this.userRepository.save(user);
  }

  // Workspace Management Methods
  async createWorkspace(data: {
    displayName: string;
    subdomain: string;
    logo?: string;
  }): Promise<Workspace> {
    // Check if subdomain is already taken
    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { subdomain: data.subdomain },
    });

    if (existingWorkspace) {
      throw new Error('Subdomain already taken');
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
    if (!subdomainRegex.test(data.subdomain)) {
      throw new Error('Invalid subdomain format');
    }

    const workspace = this.workspaceRepository.create({
      id: uuidv4(),
      displayName: data.displayName,
      subdomain: data.subdomain,
      logo: data.logo,
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
      allowImpersonation: true,
      isPublicInviteLinkEnabled: true,
      isGoogleAuthEnabled: true,
      isPasswordAuthEnabled: true,
      isMicrosoftAuthEnabled: true,
      metadataVersion: 1,
    });

    return this.workspaceRepository.save(workspace);
  }

  async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    return this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
  }

  async updateWorkspace(
    workspaceId: string,
    data: {
      displayName?: string;
      subdomain?: string;
      logo?: string;
      activationStatus?: WorkspaceActivationStatus;
      allowImpersonation?: boolean;
      isPublicInviteLinkEnabled?: boolean;
    },
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // If subdomain is being updated, check for uniqueness
    if (data.subdomain && data.subdomain !== workspace.subdomain) {
      const existingWorkspace = await this.workspaceRepository.findOne({
        where: { subdomain: data.subdomain },
      });

      if (existingWorkspace) {
        throw new Error('Subdomain already taken');
      }

      // Validate subdomain format
      const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
      if (!subdomainRegex.test(data.subdomain)) {
        throw new Error('Invalid subdomain format');
      }
    }

    Object.assign(workspace, data);

    return this.workspaceRepository.save(workspace);
  }

  async activateWorkspace(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    workspace.activationStatus = WorkspaceActivationStatus.ACTIVE;

    return this.workspaceRepository.save(workspace);
  }

  async deactivateWorkspace(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    workspace.activationStatus = WorkspaceActivationStatus.INACTIVE;

    return this.workspaceRepository.save(workspace);
  }

  async deleteWorkspace(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Soft delete by setting deletedAt
    workspace.deletedAt = new Date();

    return this.workspaceRepository.save(workspace);
  }

  async searchWorkspaces(searchTerm: string): Promise<Workspace[]> {
    return this.workspaceRepository
      .createQueryBuilder('workspace')
      .where('workspace.displayName ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('workspace.subdomain ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orderBy('workspace.createdAt', 'DESC')
      .getMany();
  }
}
