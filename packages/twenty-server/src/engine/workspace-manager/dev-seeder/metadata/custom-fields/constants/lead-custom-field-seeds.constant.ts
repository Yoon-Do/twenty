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
    type: FieldMetadataType.ADDRESS,
    label: 'Address',
    name: 'address',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Data Source',
    name: 'dataSource',
    options: [
      { label: 'Referral', value: 'REFERRAL', position: 0, color: 'blue' },
      { label: 'Website', value: 'WEBSITE', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.RELATION,
    label: 'Campaign',
    name: 'campaign',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Leads',
      targetFieldIcon: 'IconUserCircle',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'campaign',
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
    type: FieldMetadataType.SELECT,
    label: 'Interest Level',
    name: 'interestLevel',
    options: [
      { label: 'Low', value: 'LOW', position: 0, color: 'gray' },
      { label: 'Medium', value: 'MEDIUM', position: 1, color: 'yellow' },
      { label: 'High', value: 'HIGH', position: 2, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Learning Objective',
    name: 'learningObjective',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Current Level',
    name: 'currentLevel',
    options: [
      { label: 'Beginner', value: 'BEGINNER', position: 0, color: 'blue' },
      {
        label: 'Intermediate',
        value: 'INTERMEDIATE',
        position: 1,
        color: 'green',
      },
      { label: 'Advanced', value: 'ADVANCED', position: 2, color: 'purple' },
    ],
  },
  {
    type: FieldMetadataType.RELATION,
    label: 'Interested Program',
    name: 'interestedProgram',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Leads',
      targetFieldIcon: 'IconUserCircle',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'program',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Preferred Learning Format',
    name: 'preferredLearningFormat',
    options: [
      { label: 'Online', value: 'ONLINE', position: 0, color: 'blue' },
      { label: 'Offline', value: 'OFFLINE', position: 1, color: 'green' },
      { label: 'Hybrid', value: 'HYBRID', position: 2, color: 'purple' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Advisor Notes',
    name: 'advisorNotes',
  },
  {
    type: FieldMetadataType.MULTI_SELECT,
    label: 'Tags',
    name: 'tags',
    options: [
      { label: 'Important', value: 'IMPORTANT', position: 0, color: 'blue' },
      { label: 'Follow-up', value: 'FOLLOW_UP', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.BOOLEAN,
    label: 'Center Visit Status',
    name: 'centerVisitStatus',
  },
  {
    type: FieldMetadataType.DATE,
    label: 'Last Visit Date',
    name: 'lastVisitDate',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Appointment',
    name: 'appointment',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Deal Created',
    name: 'dealCreated',
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
  {
    type: FieldMetadataType.RELATION,
    label: 'Created By',
    name: 'createdBy',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Leads',
      targetFieldIcon: 'IconUserCircle',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'person',
  },
];
