import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

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
      { label: 'Closed Won', value: 'CLOSED_WON', position: 1, color: 'green' },
      { label: 'Closed Lost', value: 'CLOSED_LOST', position: 2, color: 'red' },
    ],
  },
  { type: FieldMetadataType.CURRENCY, label: 'Amount', name: 'amount' },
  { type: FieldMetadataType.NUMBER, label: 'Probability', name: 'probability' },
  { type: FieldMetadataType.DATE, label: 'Close Date', name: 'closeDate' },
  {
    type: FieldMetadataType.RELATION,
    label: 'Deal Owner',
    name: 'dealOwner',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Deals',
      targetFieldIcon: 'IconCurrencyDollar',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'person',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Created Date',
    name: 'createdDate',
  },
];
