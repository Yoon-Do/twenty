import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ENROLLMENT_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'Enrollment Code',
    name: 'enrollmentCode',
  },
  {
    type: FieldMetadataType.RELATION,
    label: 'Student',
    name: 'student',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Enrollments',
      targetFieldIcon: 'IconClipboardList',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'student',
  },
  {
    type: FieldMetadataType.RELATION,
    label: 'Class',
    name: 'class',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Enrollments',
      targetFieldIcon: 'IconClipboardList',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'class',
  },
  { type: FieldMetadataType.DATE, label: 'Start Date', name: 'startDate' },
  { type: FieldMetadataType.DATE, label: 'End Date', name: 'endDate' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Status',
    name: 'status',
    options: [
      { label: 'Active', value: 'ACTIVE', position: 0, color: 'green' },
      { label: 'Completed', value: 'COMPLETED', position: 1, color: 'blue' },
    ],
  },
];
