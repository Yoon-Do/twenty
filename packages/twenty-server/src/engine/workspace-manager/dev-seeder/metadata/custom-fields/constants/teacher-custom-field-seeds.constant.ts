import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TEACHER_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Teacher Code', name: 'teacherCode' },
  { type: FieldMetadataType.FULL_NAME, label: 'Full Name', name: 'fullName' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Gender',
    name: 'gender',
    options: [
      { label: 'Male', value: 'MALE', position: 0, color: 'blue' },
      { label: 'Female', value: 'FEMALE', position: 1, color: 'pink' },
    ],
  },
  { type: FieldMetadataType.EMAILS, label: 'Email', name: 'email' },
  { type: FieldMetadataType.PHONES, label: 'Phone', name: 'phone' },
];
