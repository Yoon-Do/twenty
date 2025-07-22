import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const DEAL_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Deal Name', name: 'dealName' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Deal Stage',
    name: 'dealStage',
    options: [
      {
        label: 'Prospecting',
        value: 'PROSPECTING',
        position: 0,
        color: 'blue',
      },
      { label: 'Won', value: 'WON', position: 1, color: 'green' },
      { label: 'Lost', value: 'LOST', position: 2, color: 'red' },
    ],
  },
  { type: FieldMetadataType.CURRENCY, label: 'Amount', name: 'amount' },
  { type: FieldMetadataType.NUMBER, label: 'Probability', name: 'probability' },
  { type: FieldMetadataType.DATE, label: 'Close Date', name: 'closeDate' },
  { type: FieldMetadataType.FULL_NAME, label: 'Deal Owner', name: 'dealOwner' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Linked Contact',
    name: 'linkedContact',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Linked Account',
    name: 'linkedAccount',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Linked Campaign',
    name: 'linkedCampaign',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Source',
    name: 'source',
    options: [
      { label: 'Website', value: 'WEBSITE', position: 0, color: 'blue' },
      { label: 'Referral', value: 'REFERRAL', position: 1, color: 'green' },
    ],
  },
  { type: FieldMetadataType.FULL_NAME, label: 'Create By', name: 'createBy' },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Created Date',
    name: 'createdDate',
  },
  {
    type: FieldMetadataType.FULL_NAME,
    label: 'Modified By',
    name: 'modifiedBy',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Modified Date',
    name: 'modifiedDate',
  },
  {
    type: FieldMetadataType.MULTI_SELECT,
    label: 'Products',
    name: 'products',
    options: [
      { label: 'Product A', value: 'PRODUCT_A', position: 0, color: 'blue' },
      { label: 'Product B', value: 'PRODUCT_B', position: 1, color: 'green' },
    ],
  },
  { type: FieldMetadataType.TEXT, label: 'Notes', name: 'notes' },
  { type: FieldMetadataType.TEXT, label: 'Attachments', name: 'attachments' },
  {
    type: FieldMetadataType.MULTI_SELECT,
    label: 'Tags',
    name: 'tags',
    options: [
      { label: 'Important', value: 'IMPORTANT', position: 0, color: 'red' },
      { label: 'Follow Up', value: 'FOLLOW_UP', position: 1, color: 'blue' },
    ],
  },
];
