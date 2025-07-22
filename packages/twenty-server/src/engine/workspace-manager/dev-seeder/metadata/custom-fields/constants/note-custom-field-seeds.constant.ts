import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const NOTE_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Note Title', name: 'noteTitle' },
  { type: FieldMetadataType.TEXT, label: 'Note Body', name: 'noteBody' },
  {
    type: FieldMetadataType.RELATION,
    label: 'Related To',
    name: 'relatedTo',
    relationCreationPayload: {
      targetObjectMetadataId: '',
      targetFieldLabel: 'Notes',
      targetFieldIcon: 'IconNote',
      type: RelationType.MANY_TO_ONE,
    },
    targetObjectNameSingular: 'lead',
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Created Date',
    name: 'createdDate',
  },
  { type: FieldMetadataType.BOOLEAN, label: 'Is Private', name: 'isPrivate' },
];
