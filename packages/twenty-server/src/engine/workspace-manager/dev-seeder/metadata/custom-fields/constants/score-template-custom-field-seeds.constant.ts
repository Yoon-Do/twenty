import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const SCORE_TEMPLATE_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'Template Name',
    name: 'templateName',
  },
  { type: FieldMetadataType.TEXT, label: 'Description', name: 'description' },
  { type: FieldMetadataType.NUMBER, label: 'Max Score', name: 'maxScore' },
  { type: FieldMetadataType.BOOLEAN, label: 'Is Active', name: 'isActive' },
  { type: FieldMetadataType.DATE, label: 'Created Date', name: 'createdDate' },
];
