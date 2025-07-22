import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const CENTER_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Center Code', name: 'centerCode' },
  { type: FieldMetadataType.TEXT, label: 'Center Name', name: 'centerName' },
  { type: FieldMetadataType.ADDRESS, label: 'Address', name: 'address' },
  { type: FieldMetadataType.PHONES, label: 'Phone', name: 'phone' },
  { type: FieldMetadataType.EMAILS, label: 'Email', name: 'email' },
];
