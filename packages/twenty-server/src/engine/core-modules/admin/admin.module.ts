import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminResolver } from 'src/engine/core-modules/admin/admin.resolver';
import { AdminService } from 'src/engine/core-modules/admin/admin.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Workspace], 'core')],
  providers: [AdminResolver, AdminService],
  exports: [AdminService],
})
export class AdminModule {}
