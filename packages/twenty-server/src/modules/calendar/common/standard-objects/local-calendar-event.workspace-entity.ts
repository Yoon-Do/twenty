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
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.localCalendarEvent,
  namePlural: 'localCalendarEvents',
  labelSingular: msg`Local Calendar Event`,
  labelPlural: msg`Local Calendar Events`,
  description: msg`Local Calendar Events created within Twenty`,
  icon: STANDARD_OBJECT_ICONS.calendarEvent,
})
export class LocalCalendarEventWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    type: FieldMetadataType.TEXT,
    label: msg`Title`,
    description: msg`Event title`,
    icon: 'IconH1',
  })
  title: string;

  @WorkspaceField({
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Event description`,
    icon: 'IconFileDescription',
  })
  @WorkspaceIsNullable()
  description: string | null;

  @WorkspaceField({
    type: FieldMetadataType.DATE_TIME,
    label: msg`Start Date`,
    description: msg`Event start date and time`,
    icon: 'IconCalendarClock',
  })
  startsAt: string;

  @WorkspaceField({
    type: FieldMetadataType.DATE_TIME,
    label: msg`End Date`,
    description: msg`Event end date and time`,
    icon: 'IconCalendarClock',
  })
  endsAt: string;

  @WorkspaceField({
    type: FieldMetadataType.TEXT,
    label: msg`Location`,
    description: msg`Event location`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  location: string | null;

  @WorkspaceField({
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Full Day`,
    description: msg`Is this an all-day event`,
    icon: 'IconHours24',
    defaultValue: false,
  })
  isFullDay: boolean;

  @WorkspaceField({
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Canceled`,
    description: msg`Is this event canceled`,
    icon: 'IconCalendarCancel',
    defaultValue: false,
  })
  isCanceled: boolean;

  // Relations with Person/Company
  @WorkspaceRelation({
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Related person`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceRelation({
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Related company`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  // Creator relation
  @WorkspaceRelation({
    type: RelationType.MANY_TO_ONE,
    label: msg`Creator`,
    description: msg`User who created this event`,
    icon: 'IconUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  creator: Relation<WorkspaceMemberWorkspaceEntity> | null;
}
