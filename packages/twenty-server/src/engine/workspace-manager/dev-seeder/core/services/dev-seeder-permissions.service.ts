import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

@Injectable()
export class DevSeederPermissionsService {
  private readonly logger = new Logger(DevSeederPermissionsService.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly objectPermissionService: ObjectPermissionService,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  public async initPermissions(workspaceId: string) {
    const adminRole = await this.roleService.createAdminRole({
      workspaceId,
    });

    let adminUserWorkspaceId: string | undefined;
    let memberUserWorkspaceIds: string[] = [];

    if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
      adminUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME;
      memberUserWorkspaceIds = [
        USER_WORKSPACE_DATA_SEED_IDS.JONY_ACME,
        USER_WORKSPACE_DATA_SEED_IDS.JANE_ACME,
        USER_WORKSPACE_DATA_SEED_IDS.PHIL_ACME,
      ];
    }

    if (adminUserWorkspaceId) {
      await this.userRoleService.assignRoleToUserWorkspace({
        workspaceId,
        userWorkspaceId: adminUserWorkspaceId,
        roleId: adminRole.id,
      });
    }

    const memberRole = await this.roleService.createMemberRole({
      workspaceId,
    });

    await this.workspaceRepository.update(workspaceId, {
      defaultRoleId: memberRole.id,
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    });

    if (memberUserWorkspaceIds) {
      for (const memberUserWorkspaceId of memberUserWorkspaceIds) {
        await this.userRoleService.assignRoleToUserWorkspace({
          workspaceId,
          userWorkspaceId: memberUserWorkspaceId,
          roleId: memberRole.id,
        });
      }
    }
  }
}
