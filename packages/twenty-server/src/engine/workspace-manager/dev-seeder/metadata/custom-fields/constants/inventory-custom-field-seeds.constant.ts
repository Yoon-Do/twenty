import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const INVENTORY_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.RELATION,
    label: 'Product',
    name: 'product',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Inventory',
      targetFieldIcon: 'IconBoxes',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'product',
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'Quantity On Hand',
    name: 'quantityOnHand',
  },
  { type: FieldMetadataType.CURRENCY, label: 'Unit Cost', name: 'unitCost' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Stock Status',
    name: 'stockStatus',
    options: [
      { label: 'In Stock', value: 'IN_STOCK', position: 0, color: 'green' },
      {
        label: 'Out of Stock',
        value: 'OUT_OF_STOCK',
        position: 1,
        color: 'red',
      },
    ],
  },
];
