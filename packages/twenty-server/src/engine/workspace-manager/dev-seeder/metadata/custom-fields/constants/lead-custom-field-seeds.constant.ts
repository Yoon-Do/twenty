import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const LEAD_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.FULL_NAME, label: 'Full Name', name: 'fullName' },
  { type: FieldMetadataType.PHONES, label: 'Mobile', name: 'mobile' },
  { type: FieldMetadataType.EMAILS, label: 'Email', name: 'email' },
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
  { type: FieldMetadataType.DATE, label: 'Birthdate', name: 'birthdate' },
  { type: FieldMetadataType.ADDRESS, label: 'Address', name: 'address' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Data Source',
    name: 'dataSource',
    options: [
      { label: 'Online', value: 'ONLINE', position: 0, color: 'blue' },
      { label: 'Referral', value: 'REFERRAL', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Campaign',
    name: 'campaign',
    options: [
      { label: 'Campaign A', value: 'CAMPAIGN_A', position: 0, color: 'blue' },
      { label: 'Campaign B', value: 'CAMPAIGN_B', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Date Create',
    name: 'dateCreate',
  },
  { type: FieldMetadataType.SELECT, label: 'Assigned To', name: 'assignedTo' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Lead Status',
    name: 'leadStatus',
    options: [
      { label: 'New', value: 'NEW', position: 0, color: 'blue' },
      { label: 'Qualified', value: 'QUALIFIED', position: 1, color: 'green' },
      { label: 'Lost', value: 'LOST', position: 2, color: 'red' },
    ],
  },
  { type: FieldMetadataType.RATING, label: 'Lead Score', name: 'leadScore' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Interest Level',
    name: 'interestLevel',
    options: [
      { label: 'High', value: 'HIGH', position: 0, color: 'green' },
      { label: 'Medium', value: 'MEDIUM', position: 1, color: 'yellow' },
      { label: 'Low', value: 'LOW', position: 2, color: 'red' },
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
        color: 'yellow',
      },
      { label: 'Advanced', value: 'ADVANCED', position: 2, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Interested Program',
    name: 'interestedProgram',
    options: [
      { label: 'Program A', value: 'PROGRAM_A', position: 0, color: 'blue' },
      { label: 'Program B', value: 'PROGRAM_B', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Preferred Learning Format',
    name: 'preferredLearningFormat',
    options: [
      { label: 'Online', value: 'ONLINE', position: 0, color: 'blue' },
      { label: 'Offline', value: 'OFFLINE', position: 1, color: 'green' },
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
      { label: 'Hot', value: 'HOT', position: 0, color: 'red' },
      { label: 'Cold', value: 'COLD', position: 1, color: 'blue' },
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
    type: FieldMetadataType.SELECT,
    label: 'Linked Student',
    name: 'linkedStudent',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Deal Created',
    name: 'dealCreated',
  },
  { type: FieldMetadataType.FULL_NAME, label: 'Create By', name: 'createBy' },
];
