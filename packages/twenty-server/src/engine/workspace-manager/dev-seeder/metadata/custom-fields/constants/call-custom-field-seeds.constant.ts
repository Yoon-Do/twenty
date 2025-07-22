import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const CALL_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Subject', name: 'subject' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Call Type',
    name: 'callType',
    options: [
      { label: 'Inbound', value: 'INBOUND', position: 0, color: 'blue' },
      { label: 'Outbound', value: 'OUTBOUND', position: 1, color: 'green' },
    ],
  },
  { type: FieldMetadataType.DATE_TIME, label: 'Date & Time', name: 'dateTime' },
  {
    type: FieldMetadataType.RELATION,
    label: 'Assigned To',
    name: 'assignedTo',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Calls',
      targetFieldIcon: 'IconPhone',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'person',
  },
];
