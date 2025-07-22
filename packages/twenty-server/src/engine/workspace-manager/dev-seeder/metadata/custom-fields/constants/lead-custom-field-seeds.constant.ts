import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const LEAD_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.FULL_NAME,
    label: 'Full Name',
    name: 'fullName',
  },
  {
    type: FieldMetadataType.PHONES,
    label: 'Mobile',
    name: 'mobile',
  },
  {
    type: FieldMetadataType.EMAILS,
    label: 'Email',
    name: 'email',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Gender',
    name: 'gender',
    options: [
      { label: 'Male', value: 'MALE', position: 0, color: 'blue' },
      { label: 'Female', value: 'FEMALE', position: 1, color: 'pink' },
      { label: 'Other', value: 'OTHER', position: 2, color: 'gray' },
    ],
  },
  {
    type: FieldMetadataType.DATE,
    label: 'Birthdate',
    name: 'birthdate',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Lead Status',
    name: 'leadStatus',
    options: [
      { label: 'New', value: 'NEW', position: 0, color: 'blue' },
      { label: 'Qualified', value: 'QUALIFIED', position: 1, color: 'green' },
      {
        label: 'Disqualified',
        value: 'DISQUALIFIED',
        position: 2,
        color: 'red',
      },
    ],
  },
  {
    type: FieldMetadataType.RATING,
    label: 'Lead Score',
    name: 'leadScore',
    options: [
      { label: '1', value: 'ONE', position: 0 },
      { label: '2', value: 'TWO', position: 1 },
      { label: '3', value: 'THREE', position: 2 },
      { label: '4', value: 'FOUR', position: 3 },
      { label: '5', value: 'FIVE', position: 4 },
    ],
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Created Date',
    name: 'createdDate',
  },
  {
    type: FieldMetadataType.RELATION,
    label: 'Assigned To',
    name: 'assignedTo',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Leads',
      targetFieldIcon: 'IconUserCircle',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'person',
  },
];
