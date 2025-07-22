import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Room Code', name: 'roomCode' },
  { type: FieldMetadataType.TEXT, label: 'Room Name', name: 'roomName' },
  {
    type: FieldMetadataType.RELATION,
    label: 'Center',
    name: 'center',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Rooms',
      targetFieldIcon: 'IconDoorEnter',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'center',
  },
  { type: FieldMetadataType.NUMBER, label: 'Capacity', name: 'capacity' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Availability Status',
    name: 'availabilityStatus',
    options: [
      { label: 'Available', value: 'AVAILABLE', position: 0, color: 'green' },
      { label: 'Unavailable', value: 'UNAVAILABLE', position: 1, color: 'red' },
    ],
  },
];
