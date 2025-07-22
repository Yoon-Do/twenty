import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PROGRAM_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'Program Name',
    name: 'programName',
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Tuition Fee',
    name: 'tuitionFee',
  },
];
