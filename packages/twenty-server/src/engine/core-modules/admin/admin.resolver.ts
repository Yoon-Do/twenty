import { UseGuards } from '@nestjs/common';
import { Args, Field, InputType, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AdminService } from 'src/engine/core-modules/admin/admin.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace, WorkspaceActivationStatus } from 'src/engine/core-modules/workspace/workspace.entity';
import { SuperAdminGuard } from 'src/engine/guards/super-admin.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

@InputType()
export class CreateWorkspaceInput {
  @Field()
  displayName: string;

  @Field()
  subdomain: string;

  @Field({ nullable: true })
  logo?: string;
}

@InputType()
export class UpdateWorkspaceInput {
  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  subdomain?: string;

  @Field({ nullable: true })
  logo?: string;

  @Field(() => WorkspaceActivationStatus, { nullable: true })
  activationStatus?: WorkspaceActivationStatus;

  @Field({ nullable: true })
  allowImpersonation?: boolean;

  @Field({ nullable: true })
  isPublicInviteLinkEnabled?: boolean;
}

@Resolver()
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Query(() => [Workspace])
  async workspaces(): Promise<Workspace[]> {
    return this.adminService.getAllWorkspaces();
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.adminService.getAllUsers();
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Query(() => User, { nullable: true })
  async user(@Args('userId') userId: string): Promise<User | null> {
    return this.adminService.getUserById(userId);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Query(() => [User])
  async searchUsers(@Args('searchTerm') searchTerm: string): Promise<User[]> {
    return this.adminService.searchUsers(searchTerm);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Query(() => Workspace, { nullable: true })
  async workspace(@Args('workspaceId') workspaceId: string): Promise<Workspace | null> {
    return this.adminService.getWorkspaceById(workspaceId);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Query(() => [Workspace])
  async searchWorkspaces(@Args('searchTerm') searchTerm: string): Promise<Workspace[]> {
    return this.adminService.searchWorkspaces(searchTerm);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Mutation(() => User)
  async promoteToSuperAdmin(@Args('userId') userId: string): Promise<User> {
    return this.adminService.promoteToSuperAdmin(userId);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Mutation(() => User)
  async revokeAdminAccess(@Args('userId') userId: string): Promise<User> {
    return this.adminService.revokeAdminAccess(userId);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Mutation(() => User)
  async disableUser(@Args('userId') userId: string): Promise<User> {
    return this.adminService.disableUser(userId);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Mutation(() => User)
  async enableUser(@Args('userId') userId: string): Promise<User> {
    return this.adminService.enableUser(userId);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Mutation(() => Workspace)
  async createWorkspace(@Args('data') data: CreateWorkspaceInput): Promise<Workspace> {
    return this.adminService.createWorkspace(data);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Mutation(() => Workspace)
  async updateWorkspace(
    @Args('workspaceId') workspaceId: string,
    @Args('data') data: UpdateWorkspaceInput,
  ): Promise<Workspace> {
    return this.adminService.updateWorkspace(workspaceId, data);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Mutation(() => Workspace)
  async activateWorkspace(@Args('workspaceId') workspaceId: string): Promise<Workspace> {
    return this.adminService.activateWorkspace(workspaceId);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Mutation(() => Workspace)
  async deactivateWorkspace(@Args('workspaceId') workspaceId: string): Promise<Workspace> {
    return this.adminService.deactivateWorkspace(workspaceId);
  }

  @UseGuards(UserAuthGuard, SuperAdminGuard)
  @Mutation(() => Workspace)
  async deleteWorkspace(@Args('workspaceId') workspaceId: string): Promise<Workspace> {
    return this.adminService.deleteWorkspace(workspaceId);
  }
}
