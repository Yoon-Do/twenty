import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TASK_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Subject', name: 'subject' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Status',
    name: 'status',
    options: [
      { label: 'Open', value: 'OPEN', position: 0, color: 'blue' },
      { label: 'Done', value: 'DONE', position: 1, color: 'green' },
    ],
  },
  { type: FieldMetadataType.DATE_TIME, label: 'Due Date', name: 'dueDate' },
  {
    type: FieldMetadataType.RELATION,
    label: 'Assigned To',
    name: 'assignedTo',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Tasks',
      targetFieldIcon: 'IconCheck',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'person',
  },
];
