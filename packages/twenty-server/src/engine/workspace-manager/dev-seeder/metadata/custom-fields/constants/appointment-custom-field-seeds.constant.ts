import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const APPOINTMENT_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Subject', name: 'subject' },
  { type: FieldMetadataType.DATE_TIME, label: 'Start Time', name: 'startTime' },
  { type: FieldMetadataType.DATE_TIME, label: 'End Time', name: 'endTime' },
  { type: FieldMetadataType.TEXT, label: 'Location', name: 'location' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Status',
    name: 'status',
    options: [
      { label: 'Scheduled', value: 'SCHEDULED', position: 0, color: 'blue' },
      { label: 'Completed', value: 'COMPLETED', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.RELATION,
    label: 'Organizer',
    name: 'organizer',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Appointments',
      targetFieldIcon: 'IconCalendar',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'person',
  },
];
