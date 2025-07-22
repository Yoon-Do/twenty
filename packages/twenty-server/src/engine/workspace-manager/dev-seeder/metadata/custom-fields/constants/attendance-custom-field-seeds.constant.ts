import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ATTENDANCE_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.RELATION,
    label: 'Student',
    name: 'student',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Attendance',
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
      targetFieldLabel: 'Attendance',
      targetFieldIcon: 'IconClipboardList',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'class',
  },
  { type: FieldMetadataType.DATE, label: 'School Day', name: 'schoolDay' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Attendance Status',
    name: 'attendanceStatus',
    options: [
      { label: 'Present', value: 'PRESENT', position: 0, color: 'green' },
      { label: 'Absent', value: 'ABSENT', position: 1, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Check-in Time',
    name: 'checkInTime',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Check-out Time',
    name: 'checkOutTime',
  },
];
