import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ORDER_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Order Number', name: 'orderNumber' },
  { type: FieldMetadataType.DATE_TIME, label: 'Order Date', name: 'orderDate' },
  {
    type: FieldMetadataType.RELATION,
    label: 'Student',
    name: 'student',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Orders',
      targetFieldIcon: 'IconReceipt',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'student',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Status',
    name: 'status',
    options: [
      { label: 'Pending', value: 'PENDING', position: 0, color: 'blue' },
      { label: 'Completed', value: 'COMPLETED', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Total Amount',
    name: 'totalAmount',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Payment Status',
    name: 'paymentStatus',
    options: [
      { label: 'Unpaid', value: 'UNPAID', position: 0, color: 'red' },
      { label: 'Paid', value: 'PAID', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Created Date',
    name: 'createdDate',
  },
];
