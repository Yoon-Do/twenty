import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PRODUCT_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Product Name', name: 'productName' },
  { type: FieldMetadataType.BOOLEAN, label: 'Active', name: 'active' },
  { type: FieldMetadataType.TEXT, label: 'Product Code', name: 'productCode' },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Standard Price',
    name: 'standardPrice',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Created Date',
    name: 'createdDate',
  },
];
