import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const STUDENT_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Student ID', name: 'studentId' },
  { type: FieldMetadataType.FULL_NAME, label: 'Full Name', name: 'fullName' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Gender',
    name: 'gender',
    options: [
      { label: 'Male', value: 'MALE', position: 0, color: 'blue' },
      { label: 'Female', value: 'FEMALE', position: 1, color: 'pink' },
      { label: 'Other', value: 'OTHER', position: 2, color: 'gray' },
    ],
  },
  {
    type: FieldMetadataType.PHONES,
    label: 'Phone Number',
    name: 'phoneNumber',
  },
  { type: FieldMetadataType.EMAILS, label: 'Email', name: 'email' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Current Level',
    name: 'currentLevel',
    options: [
      { label: 'Beginner', value: 'BEGINNER', position: 0, color: 'blue' },
      {
        label: 'Intermediate',
        value: 'INTERMEDIATE',
        position: 1,
        color: 'green',
      },
      { label: 'Advanced', value: 'ADVANCED', position: 2, color: 'purple' },
    ],
  },
  {
    type: FieldMetadataType.RELATION,
    label: 'Enrolled Program',
    name: 'enrolledProgram',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Students',
      targetFieldIcon: 'IconUser',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'program',
  },
];
