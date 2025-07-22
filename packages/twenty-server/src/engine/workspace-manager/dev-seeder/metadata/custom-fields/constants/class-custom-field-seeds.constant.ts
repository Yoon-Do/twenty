import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const CLASS_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Class Code', name: 'classCode' },
  { type: FieldMetadataType.TEXT, label: 'Class Name', name: 'className' },
  {
    type: FieldMetadataType.RELATION,
    label: 'Program',
    name: 'program',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Classes',
      targetFieldIcon: 'IconSchool',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'program',
  },
  { type: FieldMetadataType.DATE, label: 'Start Date', name: 'startDate' },
  { type: FieldMetadataType.DATE, label: 'End Date', name: 'endDate' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Status',
    name: 'status',
    options: [
      { label: 'Planned', value: 'PLANNED', position: 0, color: 'blue' },
      {
        label: 'In Progress',
        value: 'IN_PROGRESS',
        position: 1,
        color: 'green',
      },
    ],
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Created Date',
    name: 'createdDate',
  },
];
