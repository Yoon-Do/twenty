import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.localCalendarEvent,
  namePlural: 'localCalendarEvents',
  labelSingular: msg`Local calendar event`,
  labelPlural: msg`Local calendar events`,
  description: msg`Local calendar events`,
  icon: STANDARD_OBJECT_ICONS.localCalendarEvent,
  labelIdentifierStandardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.title,
})
export class LocalCalendarEventWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: msg`Title`,
    description: msg`Title`,
    icon: 'IconH1',
  })
  title: string;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Description`,
    icon: 'IconFileDescription',
  })
  @WorkspaceIsNullable()
  description: string | null;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.startsAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Start Date`,
    description: msg`Start Date`,
    icon: 'IconCalendarClock',
  })
  startsAt: string;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.endsAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`End Date`,
    description: msg`End Date`,
    icon: 'IconCalendarClock',
  })
  endsAt: string;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.location,
    type: FieldMetadataType.TEXT,
    label: msg`Location`,
    description: msg`Location`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  location: string | null;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.isFullDay,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Full Day`,
    description: msg`Is Full Day`,
    icon: 'IconHours24',
    defaultValue: false,
  })
  isFullDay: boolean;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.isCanceled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is canceled`,
    description: msg`Is canceled`,
    icon: 'IconCalendarCancel',
    defaultValue: false,
  })
  isCanceled: boolean;

  @WorkspaceRelation({
    standardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Person`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'localCalendarEvents',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceRelation({
    standardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Company`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'localCalendarEvents',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceRelation({
    standardId: LOCAL_CALENDAR_EVENT_STANDARD_FIELD_IDS.creator,
    type: RelationType.MANY_TO_ONE,
    label: msg`Creator`,
    description: msg`Creator`,
    icon: 'IconUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'localCalendarEvents',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  creator: Relation<WorkspaceMemberWorkspaceEntity> | null;
}
