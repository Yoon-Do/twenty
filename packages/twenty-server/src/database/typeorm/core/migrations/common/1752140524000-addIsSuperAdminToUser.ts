import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsSuperAdminToUser1752140524000 implements MigrationInterface {
  name = 'AddIsSuperAdminToUser1752140524000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "isSuperAdmin" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP COLUMN "isSuperAdmin"`,
    );
  }
}
