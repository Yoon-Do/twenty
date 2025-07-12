import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { SuperAdminGuard } from 'src/engine/guards/super-admin.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';
import { CrossWorkspaceAdminService } from 'src/engine/core-modules/admin-panel/cross-workspace-admin.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';

// DTOs
class WorkspaceSummaryDto {
  id: string;
  name: string;
  subdomain?: string;
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
  activationStatus: string;
  isActive: boolean;
}

@UsePipes(ResolverValidationPipe)
@Resolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class CrossWorkspaceAdminResolver {
  constructor(
    private readonly crossWorkspaceAdminService: CrossWorkspaceAdminService,
  ) {}

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, SuperAdminGuard)
  @Query(() => [WorkspaceSummaryDto])
  async getAllWorkspaces(): Promise<WorkspaceSummaryDto[]> {
    return await this.crossWorkspaceAdminService.getAllWorkspacesSummary();
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, SuperAdminGuard)
  @Query(() => GraphQLJSON)
  async getWorkspaceDetails(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
  ): Promise<Record<string, unknown>> {
    return await this.crossWorkspaceAdminService.getWorkspaceDetails(
      workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, SuperAdminGuard)
  @Mutation(() => String)
  async generateWorkspaceAccessToken(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @AuthUser() user: User,
  ): Promise<string> {
    return await this.crossWorkspaceAdminService.generateWorkspaceAccessToken(
      user.id,
      workspaceId,
      user,
    );
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, SuperAdminGuard)
  @Mutation(() => Boolean)
  async addAdminToWorkspace(
    @Args('adminUserId', { type: () => String }) adminUserId: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @AuthUser() user: User,
  ): Promise<boolean> {
    await this.crossWorkspaceAdminService.addAdminToWorkspace(
      adminUserId,
      workspaceId,
      user,
    );

    return true;
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, SuperAdminGuard)
  @Query(() => GraphQLJSON)
  async getWorkspaceData(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('entityName', { type: () => String }) entityName: string,
    @Args('limit', { type: () => Number, nullable: true, defaultValue: 100 })
    limit: number,
    @Args('offset', { type: () => Number, nullable: true, defaultValue: 0 })
    offset: number,
    @AuthUser() user: User,
  ): Promise<Record<string, unknown>> {
    return await this.crossWorkspaceAdminService.getWorkspaceData(
      workspaceId,
      entityName,
      user,
      { limit, offset },
    );
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, SuperAdminGuard)
  @Mutation(() => GraphQLJSON)
  async executeWorkspaceQuery(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('query', { type: () => String }) query: string,
    @AuthUser() user: User,
  ): Promise<Record<string, unknown>> {
    return await this.crossWorkspaceAdminService.executeWorkspaceQuery(
      workspaceId,
      query,
      user,
    );
  }
}
