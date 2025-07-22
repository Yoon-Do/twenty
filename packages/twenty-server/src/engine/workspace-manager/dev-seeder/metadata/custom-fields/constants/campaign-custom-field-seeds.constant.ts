import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const CAMPAIGN_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'Campaign Name',
    name: 'campaignName',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Campaign Type',
    name: 'campaignType',
    options: [
      { label: 'Email', value: 'EMAIL', position: 0, color: 'blue' },
      { label: 'Social', value: 'SOCIAL', position: 1, color: 'green' },
    ],
  },
];
