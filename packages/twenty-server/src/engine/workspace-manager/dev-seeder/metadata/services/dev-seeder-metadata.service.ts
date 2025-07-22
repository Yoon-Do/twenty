import { Injectable } from '@nestjs/common';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';
import { COMPANY_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/company-custom-field-seeds.constant';
import { PERSON_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/person-custom-field-seeds.constant';
import { SURVEY_RESULT_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/survey-results-field-seeds.constant';
import { SURVEY_RESULT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/survey-results-object-seed.constant';
import { LEAD_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/lead-custom-field-seeds.constant';
import { LEAD_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/lead-custom-object-seed.constant';
import { CAMPAIGN_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/campaign-custom-field-seeds.constant';
import { CAMPAIGN_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/campaign-custom-object-seed.constant';
import { PROGRAM_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/program-custom-field-seeds.constant';
import { PROGRAM_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/program-custom-object-seed.constant';
import { DEAL_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/deal-custom-field-seeds.constant';
import { DEAL_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/deal-custom-object-seed.constant';
import { STUDENT_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/student-custom-field-seeds.constant';
import { STUDENT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/student-custom-object-seed.constant';
import { ORDER_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/order-custom-object-seed.constant';
import { ORDER_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/order-custom-field-seeds.constant';
import { CLASS_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/class-custom-object-seed.constant';
import { CLASS_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/class-custom-field-seeds.constant';
import { APPOINTMENT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/appointment-custom-object-seed.constant';
import { APPOINTMENT_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/appointment-custom-field-seeds.constant';
import { ATTENDANCE_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/attendance-custom-object-seed.constant';
import { ATTENDANCE_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/attendance-custom-field-seeds.constant';
import { CALL_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/call-custom-object-seed.constant';
import { CALL_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/call-custom-field-seeds.constant';
import { ENROLLMENT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/enrollment-custom-object-seed.constant';
import { ENROLLMENT_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/enrollment-custom-field-seeds.constant';
import { NOTE_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/note-custom-object-seed.constant';
import { NOTE_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/note-custom-field-seeds.constant';
import { PRODUCT_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/product-custom-object-seed.constant';
import { PRODUCT_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/product-custom-field-seeds.constant';
import { ROOM_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/room-custom-object-seed.constant';
import { ROOM_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/room-custom-field-seeds.constant';
import { SCORE_TEMPLATE_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/score-template-custom-object-seed.constant';
import { SCORE_TEMPLATE_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/score-template-custom-field-seeds.constant';
import { TASK_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/task-custom-object-seed.constant';
import { TASK_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/task-custom-field-seeds.constant';
import { TEACHER_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/teacher-custom-object-seed.constant';
import { TEACHER_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/teacher-custom-field-seeds.constant';
import { INVENTORY_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/inventory-custom-object-seed.constant';
import { INVENTORY_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/inventory-custom-field-seeds.constant';
import { CENTER_CUSTOM_OBJECT_SEED } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-objects/constants/center-custom-object-seed.constant';
import { CENTER_CUSTOM_FIELD_SEEDS } from 'src/engine/workspace-manager/dev-seeder/metadata/custom-fields/constants/center-custom-field-seeds.constant';
import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';
import { ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

@Injectable()
export class DevSeederMetadataService {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  private readonly workspaceConfigs: Record<
    string,
    {
      objects: { seed: ObjectMetadataSeed; fields?: FieldMetadataSeed[] }[];
      fields: { objectName: string; seeds: FieldMetadataSeed[] }[];
    }
  > = {
    [SEED_YCOMBINATOR_WORKSPACE_ID]: {
      objects: [
        {
          seed: CAMPAIGN_CUSTOM_OBJECT_SEED,
          fields: CAMPAIGN_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: PROGRAM_CUSTOM_OBJECT_SEED,
          fields: PROGRAM_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: DEAL_CUSTOM_OBJECT_SEED,
          fields: DEAL_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: ORDER_CUSTOM_OBJECT_SEED,
          fields: ORDER_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: CLASS_CUSTOM_OBJECT_SEED,
          fields: CLASS_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: APPOINTMENT_CUSTOM_OBJECT_SEED,
          fields: APPOINTMENT_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: ATTENDANCE_CUSTOM_OBJECT_SEED,
          fields: ATTENDANCE_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: CALL_CUSTOM_OBJECT_SEED,
          fields: CALL_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: ENROLLMENT_CUSTOM_OBJECT_SEED,
          fields: ENROLLMENT_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: NOTE_CUSTOM_OBJECT_SEED,
          fields: NOTE_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: PRODUCT_CUSTOM_OBJECT_SEED,
          fields: PRODUCT_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: ROOM_CUSTOM_OBJECT_SEED,
          fields: ROOM_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: SCORE_TEMPLATE_CUSTOM_OBJECT_SEED,
          fields: SCORE_TEMPLATE_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: TASK_CUSTOM_OBJECT_SEED,
          fields: TASK_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: TEACHER_CUSTOM_OBJECT_SEED,
          fields: TEACHER_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: INVENTORY_CUSTOM_OBJECT_SEED,
          fields: INVENTORY_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: CENTER_CUSTOM_OBJECT_SEED,
          fields: CENTER_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: STUDENT_CUSTOM_OBJECT_SEED,
          fields: STUDENT_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: LEAD_CUSTOM_OBJECT_SEED,
          fields: LEAD_CUSTOM_FIELD_SEEDS,
        },
        {
          seed: SURVEY_RESULT_CUSTOM_OBJECT_SEED,
          fields: SURVEY_RESULT_CUSTOM_FIELD_SEEDS,
        },
      ],
      fields: [
        { objectName: 'company', seeds: COMPANY_CUSTOM_FIELD_SEEDS },
        { objectName: 'person', seeds: PERSON_CUSTOM_FIELD_SEEDS },
      ],
    },
  };

  public async seed({
    dataSourceMetadata,
    workspaceId,
  }: {
    dataSourceMetadata: DataSourceEntity;
    workspaceId: string;
  }) {
    const config = this.workspaceConfigs[workspaceId];

    if (!config) {
      throw new Error(
        `Workspace configuration not found for workspaceId: ${workspaceId}`,
      );
    }

    for (const obj of config.objects) {
      await this.seedCustomObject({
        dataSourceId: dataSourceMetadata.id,
        workspaceId,
        objectMetadataSeed: obj.seed,
      });

      if (obj.fields) {
        await this.seedCustomFields({
          workspaceId,
          objectMetadataNameSingular: obj.seed.nameSingular,
          fieldMetadataSeeds: obj.fields,
        });
      }
    }

    for (const fieldConfig of config.fields) {
      await this.seedCustomFields({
        workspaceId,
        objectMetadataNameSingular: fieldConfig.objectName,
        fieldMetadataSeeds: fieldConfig.seeds,
      });
    }
  }

  private async seedCustomObject({
    dataSourceId,
    workspaceId,
    objectMetadataSeed,
  }: {
    dataSourceId: string;
    workspaceId: string;
    objectMetadataSeed: ObjectMetadataSeed;
  }): Promise<void> {
    await this.objectMetadataService.createOne({
      ...objectMetadataSeed,
      dataSourceId,
      workspaceId,
    });
  }

  private async seedCustomFields({
    workspaceId,
    objectMetadataNameSingular,
    fieldMetadataSeeds,
  }: {
    workspaceId: string;
    objectMetadataNameSingular: string;
    fieldMetadataSeeds: FieldMetadataSeed[];
  }): Promise<void> {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: { nameSingular: objectMetadataNameSingular },
      });

    if (!objectMetadata) {
      throw new Error(
        `Object metadata not found for: ${objectMetadataNameSingular}`,
      );
    }

    const preparedSeeds = [] as CreateFieldInput[];

    for (const fieldMetadataSeed of fieldMetadataSeeds) {
      const seedCopy = { ...fieldMetadataSeed } as FieldMetadataSeed;

      if (
        seedCopy.targetObjectNameSingular &&
        seedCopy.relationCreationPayload
      ) {
        const targetObjectMetadata =
          await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
            where: { nameSingular: seedCopy.targetObjectNameSingular },
          });

        if (!targetObjectMetadata) {
          throw new Error(
            `Target object metadata not found for: ${seedCopy.targetObjectNameSingular}`,
          );
        }

        seedCopy.relationCreationPayload = {
          ...seedCopy.relationCreationPayload,
          targetObjectMetadataId: targetObjectMetadata.id,
        };
      }

      delete seedCopy.targetObjectNameSingular;

      preparedSeeds.push({
        ...seedCopy,
        objectMetadataId: objectMetadata.id,
        workspaceId,
      });
    }

    await this.fieldMetadataService.createMany(preparedSeeds);
  }
}
