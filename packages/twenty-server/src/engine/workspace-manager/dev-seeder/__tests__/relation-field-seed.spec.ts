import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { DevSeederMetadataService } from 'src/engine/workspace-manager/dev-seeder/metadata/services/dev-seeder-metadata.service';

describe('DevSeederMetadataService relation field', () => {
  it('should resolve target object id for relation fields', async () => {
    const mockObjectMetadataService = {
      findOneWithinWorkspace: jest
        .fn()
        .mockResolvedValueOnce({ id: 'pet-id' })
        .mockResolvedValueOnce({ id: 'person-id' }),
    } as any;

    const mockFieldMetadataService = { createMany: jest.fn() } as any;

    const service = new DevSeederMetadataService(
      mockObjectMetadataService,
      mockFieldMetadataService,
    );

    await (service as any).seedCustomFields({
      workspaceId: 'ws',
      objectMetadataNameSingular: 'pet',
      fieldMetadataSeeds: [
        {
          type: FieldMetadataType.RELATION,
          label: 'Owner',
          name: 'owner',
          relationCreationPayload: {
            targetObjectMetadataId: '',
            targetFieldLabel: 'Pets',
            targetFieldIcon: 'IconCat',
            type: RelationType.MANY_TO_ONE,
          },
          targetObjectNameSingular: 'person',
        },
      ],
    });

    expect(mockFieldMetadataService.createMany).toHaveBeenCalledWith([
      {
        type: FieldMetadataType.RELATION,
        label: 'Owner',
        name: 'owner',
        relationCreationPayload: {
          targetObjectMetadataId: 'person-id',
          targetFieldLabel: 'Pets',
          targetFieldIcon: 'IconCat',
          type: RelationType.MANY_TO_ONE,
        },
        objectMetadataId: 'pet-id',
        workspaceId: 'ws',
      },
    ]);
  });
});
