# Local Calendar Implementation Plan

## Tổng quan

Tài liệu này mô tả kế hoạch chi tiết để implement tính năng Local Calendar trong Twenty, cho phép người dùng tạo, chỉnh sửa và xóa calendar events trực tiếp trong ứng dụng mà không cần phụ thuộc vào Google/Microsoft Calendar.

## Phân tích hiện trạng

### Backend (twenty-server)
- **CalendarEvent Entity**: Đã có sẵn với các trường cơ bản
- **GraphQL API**: Chỉ có queries để đọc events, chưa có mutations
- **Service Layer**: Chỉ xử lý việc đọc dữ liệu từ external sources

### Frontend (twenty-front)
- **Calendar Component**: Hiển thị events theo tháng trong Person/Company tabs
- **UI Pattern**: Tương tự Tasks/Notes với Command Menu approach
- **Data Flow**: Chỉ fetch và display, chưa có create/update

## ⚠️ Phân tích Rủi ro và Approach Mới

### Rủi ro nghiêm trọng đã phát hiện:

**1. Calendar Import System phức tạp:**
- `CalendarEventsImportService` có logic phức tạp với transaction handling
- `CalendarSaveEventsService` sử dụng `iCalUID` làm unique identifier
- Có nhiều background jobs và cron jobs xử lý sync
- Logic filter và blocklist phức tạp

**2. Data Model Dependencies:**
- CalendarEvent được link với `CalendarChannelEventAssociation`
- Có relationship phức tạp với `ConnectedAccount`
- Participant management qua separate service
- External ID và sync status tracking

**3. Conflict Risks:**
- Local events có thể conflict với imported events
- iCalUID collision có thể xảy ra
- Transaction rollback có thể affect existing import logic
- Permission model có thể không tương thích

### 🛡️ Approach An toàn: Minimal Impact Strategy

**Nguyên tắc**: Tối thiểu hóa impact lên existing system, tách biệt local events

**Key Decisions:**
1. **Không modify CalendarEvent entity** - quá rủi ro
2. **Tạo separate LocalCalendarEvent entity** - tách biệt hoàn toàn
3. **Sử dụng existing UI patterns** - tận dụng components
4. **Gradual integration** - từng bước một

### Kiến trúc Mới: Separate Entity Approach

```typescript
// Tạo entity riêng cho local events
@WorkspaceEntity({
  standardId: 'localCalendarEvent',
  namePlural: 'localCalendarEvents',
  labelSingular: 'Local Calendar Event',
  labelPlural: 'Local Calendar Events',
})
export class LocalCalendarEventWorkspaceEntity extends BaseWorkspaceEntity {
  // Các fields tương tự CalendarEvent nhưng simplified
  // Không có external dependencies
}
```

**Lợi ích:**
- ✅ Zero risk cho existing import system
- ✅ Có thể test độc lập
- ✅ Dễ rollback nếu có vấn đề
- ✅ Không affect performance của calendar sync
- ✅ Có thể merge sau khi stable

## Phase 1: Backend Foundation - Separate Entity Approach

### 1.1 Tạo LocalCalendarEvent Entity (An toàn)

**Lý do chọn Separate Entity:**
- ✅ **Zero Risk**: Không ảnh hưởng đến existing calendar import system
- ✅ **Clean Architecture**: Tách biệt concerns giữa local và external events  
- ✅ **Easy Testing**: Có thể test độc lập
- ✅ **Gradual Migration**: Có thể merge entities sau khi stable
- ✅ **Rollback Safety**: Dễ dàng rollback nếu có vấn đề

**File**: `packages/twenty-server/src/modules/calendar/common/standard-objects/local-calendar-event.workspace-entity.ts`

```typescript
import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';

@WorkspaceEntity({
  standardId: 'localCalendarEvent',
  namePlural: 'localCalendarEvents',
  labelSingular: msg`Local Calendar Event`,
  labelPlural: msg`Local Calendar Events`,
  description: msg`Local Calendar Events created within Twenty`,
  icon: 'IconCalendarEvent',
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

  // Relations với Person/Company
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
```

### 1.2 Tận dụng Auto-generated GraphQL (Không cần tạo mutations thủ công)

**Key Insight**: LocalCalendarEvent là WorkspaceEntity → GraphQL mutations được auto-generate!

```typescript
// Mutations sẽ được tự động tạo:
// - createLocalCalendarEvent
// - updateLocalCalendarEvent  
// - deleteLocalCalendarEvent
// - findManyLocalCalendarEvents
// - findUniqueLocalCalendarEvent

// Không cần viết resolver thủ công!
```

**Lợi ích của approach này:**
- ✅ **Zero Backend Code**: Không cần viết mutations/resolvers
- ✅ **Standard Patterns**: Sử dụng existing Twenty patterns
- ✅ **Auto Permissions**: Permission system tự động apply
- ✅ **Type Safety**: TypeScript types tự động generate

### 1.3 Cập nhật CoreObjectNameSingular

**File**: `packages/twenty-front/src/modules/object-metadata/types/CoreObjectNameSingular.ts`

```typescript
export enum CoreObjectNameSingular {
  // ... existing objects
  CalendarEvent = 'calendarEvent',
  LocalCalendarEvent = 'localCalendarEvent', // Thêm dòng này
  // ... rest
}
```

**File**: `packages/twenty-front/src/modules/object-metadata/types/CoreObjectNamePlural.ts`

```typescript
export enum CoreObjectNamePlural {
  // ... existing objects
  CalendarEvent = 'calendarEvents',
  LocalCalendarEvent = 'localCalendarEvents', // Thêm dòng này
  // ... rest
}
```

**File**: `packages/twenty-server/src/engine/core-modules/calendar/dtos/create-calendar-event-input.dto.ts`

```typescript
@InputType()
export class CreateCalendarEventInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  startsAt: string;

  @Field()
  endsAt: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  isFullDay: boolean;

  @Field(() => [String], { nullable: true })
  participantIds?: string[];

  @Field()
  targetableObjectId: string;

  @Field()
  targetableObjectType: string; // 'person' | 'company'
}
```

### 1.4 Cập nhật Service Layer

**File**: `packages/twenty-server/src/engine/core-modules/calendar/timeline-calendar-event.service.ts`

```typescript
// Thêm methods mới
async createCalendarEvent({
  input,
  creatorId,
}: {
  input: CreateCalendarEventInput;
  creatorId: string;
}): Promise<TimelineCalendarEvent> {
  const calendarEventRepository = await this.twentyORMManager.getRepository<CalendarEventWorkspaceEntity>('calendarEvent');
  
  // Tạo calendar event
  const calendarEvent = await calendarEventRepository.save({
    title: input.title,
    description: input.description,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    location: input.location,
    isFullDay: input.isFullDay,
    sourceType: 'TWENTY_LOCAL',
    creatorId,
    iCalUID: `twenty-local-${Date.now()}-${Math.random()}`,
  });

  // Tạo participants nếu có
  if (input.participantIds?.length) {
    await this.createEventParticipants(calendarEvent.id, input.participantIds);
  }

  // Link với targetable object
  await this.linkEventToTargetableObject(
    calendarEvent.id,
    input.targetableObjectId,
    input.targetableObjectType
  );

  return this.formatCalendarEventForResponse(calendarEvent);
}

async updateCalendarEvent({
  id,
  input,
  workspaceMemberId,
}: {
  id: string;
  input: UpdateCalendarEventInput;
  workspaceMemberId: string;
}): Promise<TimelineCalendarEvent> {
  // Kiểm tra quyền sở hữu
  const existingEvent = await this.findCalendarEventById(id);
  if (existingEvent.sourceType !== 'TWENTY_LOCAL' || existingEvent.creatorId !== workspaceMemberId) {
    throw new ForbiddenException('Cannot update this calendar event');
  }

  // Update logic
  // ...
}

async deleteCalendarEvent({
  id,
  workspaceMemberId,
}: {
  id: string;
  workspaceMemberId: string;
}): Promise<boolean> {
  // Kiểm tra quyền và xóa
  // ...
}
```

## Phase 2: Frontend Implementation (Tận dụng Existing System)

### 2.1 Tạo Hook tạo Local Calendar Event (Tận dụng existing patterns)

**File**: `packages/twenty-front/src/modules/activities/calendar/hooks/useCreateNewLocalCalendarEvent.ts`

```typescript
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { v4 } from 'uuid';

// Pattern tương tự useCreateNewIndexRecord - TẬN DỤNG EXISTING SYSTEM
export const useCreateNewLocalCalendarEvent = () => {
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent, // Sử dụng LocalCalendarEvent
    shouldMatchRootQueryFilter: true,
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const createNewLocalCalendarEvent = async ({
    targetableObject,
    recordInput = {},
  }: {
    targetableObject: ActivityTargetableObject;
    recordInput?: Record<string, any>;
  }) => {
    const recordId = v4();
    
    // Tạo local calendar event với default values
    const relationField = targetableObject.targetObjectNameSingular === 'person' 
      ? { personId: targetableObject.id }
      : { companyId: targetableObject.id };
    
    await createOneRecord({
      id: recordId,
      title: 'Untitled Event',
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // +1 hour
      isFullDay: false,
      isCanceled: false,
      ...relationField, // Link với person hoặc company
      ...recordInput,
    });

    // Mở trong Command Menu để edit (existing pattern)
    openRecordInCommandMenu({
      recordId,
      objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
      isNewRecord: true,
    });
  };

  return { createNewLocalCalendarEvent };
};
```

### 2.2 Tạo Calendar Create Button (Pattern từ RecordBoardColumnNewRecordButton)

**File**: `packages/twenty-front/src/modules/activities/calendar/components/LocalCalendarNewEventButton.tsx`

```typescript
import { useCreateNewLocalCalendarEvent } from '@/activities/calendar/hooks/useCreateNewLocalCalendarEvent';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledNewButton = styled(Button)`
  gap: ${({ theme }) => theme.spacing(1)};
`;

type LocalCalendarNewEventButtonProps = {
  targetableObject: ActivityTargetableObject;
  size?: 'small' | 'medium';
  variant?: 'primary' | 'secondary';
};

export const LocalCalendarNewEventButton = ({
  targetableObject,
  size = 'small',
  variant = 'secondary',
}: LocalCalendarNewEventButtonProps) => {
  // Sử dụng existing permission system cho LocalCalendarEvent
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent, // Sử dụng LocalCalendarEvent
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasCreatePermission = objectPermissions.canCreateObjectRecords;
  const { createNewLocalCalendarEvent } = useCreateNewLocalCalendarEvent();

  if (!hasCreatePermission) {
    return null;
  }

  return (
    <StyledNewButton
      Icon={IconPlus}
      size={size}
      variant={variant}
      title="Add event"
      onClick={() => createNewLocalCalendarEvent({ targetableObject })}
    >
      {size !== 'small' && 'New Event'}
    </StyledNewButton>
  );
};
```

### 2.3 Cập nhật Calendar Component (Tận dụng existing structure)

**File**: `packages/twenty-front/src/modules/activities/calendar/components/Calendar.tsx`

```typescript
// Thêm imports
import { LocalCalendarNewEventButton } from '@/activities/calendar/components/LocalCalendarNewEventButton';

// Thêm styled components
const StyledHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4, 6, 2, 6)};
`;

export const Calendar = ({ targetableObject }) => {
  // Existing logic giữ nguyên...

  // Cập nhật empty state - TẬN DỤNG EXISTING PATTERN
  if (!firstQueryLoading && !timelineCalendarEvents?.length) {
    return (
      <AnimatedPlaceholderEmptyContainer
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noCalendarEvent" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>No Events</AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            No events have been scheduled with this {targetableObject.targetObjectNameSingular} yet.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        {/* Sử dụng LocalCalendarNewEventButton component */}
        <LocalCalendarNewEventButton 
          targetableObject={targetableObject}
          variant="secondary"
        />
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <CalendarContext.Provider value={{ calendarEventsByDayTime }}>
      <StyledContainer>
        {/* Header với nút Create - TẬN DỤNG EXISTING PATTERN */}
        <StyledHeaderContainer>
          <H3Title title="Calendar Events" />
          <LocalCalendarNewEventButton 
            targetableObject={targetableObject}
            size="small"
            variant="secondary"
          />
        </StyledHeaderContainer>
        
        {/* Existing calendar content - KHÔNG THAY ĐỔI */}
        {monthTimes.map((monthTime) => {
          const monthDayTimes = daysByMonthTime[monthTime] || [];
          const year = getYear(monthTime);
          const lastMonthTimeOfYear = monthTimesByYear[year]?.[0];
          const isLastMonthOfYear = lastMonthTimeOfYear === monthTime;
          const monthLabel = format(monthTime, 'MMMM');

          return (
            <Section key={monthTime}>
              <StyledTitleContainer>
                <H3Title
                  title={
                    <>
                      {monthLabel}
                      {isLastMonthOfYear && <StyledYear> {year}</StyledYear>}
                    </>
                  }
                />
              </StyledTitleContainer>
              <CalendarMonthCard dayTimes={monthDayTimes} />
            </Section>
          );
        })}
        <CustomResolverFetchMoreLoader
          loading={isFetchingMore || firstQueryLoading}
          onLastRowVisible={handleLastRowVisible}
        />
      </StyledContainer>
    </CalendarContext.Provider>
  );
};
```

### 2.4 🎯 Native Experience: Seamless Integration với Timeline Calendar

**Yêu cầu**: Local events phải hiển thị **giống y chang** external events trên timeline

**Chiến lược**: Transform LocalCalendarEvent thành TimelineCalendarEvent format

**File**: `packages/twenty-front/src/modules/activities/calendar/hooks/useUnifiedCalendarEvents.ts`

```typescript
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { TimelineCalendarEvent, CalendarChannelVisibility } from '~/generated/graphql';

export const useUnifiedCalendarEvents = (targetableObject: ActivityTargetableObject) => {
  // Existing external events - GIỮ NGUYÊN
  const { 
    data: externalEventsData, 
    loading: externalLoading,
    fetchMoreRecords: fetchMoreExternal,
    isFetchingMore: isFetchingMoreExternal
  } = useCustomResolver<TimelineCalendarEventsWithTotal>(
    // ... existing logic giữ nguyên
  );

  // Local events - TẬN DỤNG EXISTING HOOK
  const { records: localEvents, loading: localLoading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
    filter: targetableObject.targetObjectNameSingular === 'person' 
      ? { personId: { eq: targetableObject.id } }
      : { companyId: { eq: targetableObject.id } },
    orderBy: [{ startsAt: 'DescNullsLast' }], // Giống external events
  });

  // 🎯 TRANSFORM LOCAL EVENTS THÀNH TIMELINE FORMAT
  const transformedLocalEvents: TimelineCalendarEvent[] = useMemo(() => {
    return localEvents.map(event => ({
      id: event.id,
      title: event.title || 'Untitled Event',
      description: event.description || '',
      location: event.location || '',
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      isFullDay: event.isFullDay,
      isCanceled: event.isCanceled,
      visibility: CalendarChannelVisibility.SHARE_EVERYTHING, // Local events luôn visible
      conferenceSolution: '',
      conferenceLink: {
        primaryLinkLabel: '',
        primaryLinkUrl: '',
        secondaryLinks: null,
      },
      participants: [], // TODO: Implement participants later
      __typename: 'TimelineCalendarEvent', // 🎯 QUAN TRỌNG: Giống external events
      // Thêm flag để phân biệt (chỉ dùng internal)
      _isLocalEvent: true,
    }));
  }, [localEvents]);

  // 🎯 MERGE VÀ SORT GIỐNG EXISTING LOGIC
  const unifiedEvents = useMemo(() => {
    const external = externalEventsData?.timelineCalendarEvents || [];
    const combined = [...external, ...transformedLocalEvents];
    
    // Sort theo startsAt giống existing logic
    return combined.sort((a, b) => 
      new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
    );
  }, [externalEventsData?.timelineCalendarEvents, transformedLocalEvents]);

  // 🎯 RETURN SAME INTERFACE AS EXISTING HOOK
  return {
    data: {
      [targetableObject.targetObjectNameSingular === 'person' 
        ? 'getTimelineCalendarEventsFromPersonId'
        : 'getTimelineCalendarEventsFromCompanyId'
      ]: {
        timelineCalendarEvents: unifiedEvents,
        totalNumberOfCalendarEvents: unifiedEvents.length,
      }
    },
    firstQueryLoading: externalLoading || localLoading,
    isFetchingMore: isFetchingMoreExternal,
    fetchMoreRecords: fetchMoreExternal, // Chỉ external events có pagination
  };
};
```

### 2.5 🎯 Native Experience: Cập nhật Calendar Component

**Mục tiêu**: User không phân biệt được local vs external events

**File**: `packages/twenty-front/src/modules/activities/calendar/components/Calendar.tsx`

```typescript
// Thay thế existing hook bằng unified hook
import { useUnifiedCalendarEvents } from '@/activities/calendar/hooks/useUnifiedCalendarEvents';
import { LocalCalendarNewEventButton } from '@/activities/calendar/components/LocalCalendarNewEventButton';

export const Calendar = ({ targetableObject }) => {
  // 🎯 SỬ DỤNG UNIFIED HOOK - TRANSPARENT CHO USER
  const { data, firstQueryLoading, isFetchingMore, fetchMoreRecords } = 
    useUnifiedCalendarEvents(targetableObject);

  // Extract data giống existing logic
  const { timelineCalendarEvents, totalNumberOfCalendarEvents } =
    data?.[targetableObject.targetObjectNameSingular === 'person' 
      ? 'getTimelineCalendarEventsFromPersonId'
      : 'getTimelineCalendarEventsFromCompanyId'
    ] ?? {};

  const hasMoreCalendarEvents =
    timelineCalendarEvents && totalNumberOfCalendarEvents
      ? timelineCalendarEvents?.length < totalNumberOfCalendarEvents
      : false;

  // 🎯 EXISTING LOGIC GIỮ NGUYÊN - ZERO CHANGES
  const {
    calendarEventsByDayTime,
    daysByMonthTime,
    monthTimes,
    monthTimesByYear,
  } = useCalendarEvents(timelineCalendarEvents || []);

  if (firstQueryLoading) {
    return <SkeletonLoader />;
  }

  // 🎯 NATIVE EXPERIENCE: Nút tạo giống Tasks/Notes
  if (!firstQueryLoading && !timelineCalendarEvents?.length) {
    return (
      <AnimatedPlaceholderEmptyContainer
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noMatchRecord" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>No Events</AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            No events have been scheduled with this {targetableObject.targetObjectNameSingular} yet.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        {/* 🎯 NÚT TẠO GIỐNG Y CHANG TASKS/NOTES */}
        <LocalCalendarNewEventButton 
          targetableObject={targetableObject}
          variant="secondary"
        />
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <CalendarContext.Provider value={{ calendarEventsByDayTime }}>
      <StyledContainer>
        {/* 🎯 HEADER VỚI NÚT CREATE - GIỐNG TASKS/NOTES */}
        <StyledHeaderContainer>
          <H3Title title="Calendar Events" />
          <LocalCalendarNewEventButton 
            targetableObject={targetableObject}
            size="small"
            variant="secondary"
          />
        </StyledHeaderContainer>

        {/* 🎯 EXISTING CALENDAR DISPLAY - ZERO CHANGES */}
        {monthTimes.map((monthTime) => {
          const monthDayTimes = daysByMonthTime[monthTime] || [];
          const year = getYear(monthTime);
          const lastMonthTimeOfYear = monthTimesByYear[year]?.[0];
          const isLastMonthOfYear = lastMonthTimeOfYear === monthTime;
          const monthLabel = format(monthTime, 'MMMM');

          return (
            <Section key={monthTime}>
              <StyledTitleContainer>
                <H3Title
                  title={
                    <>
                      {monthLabel}
                      {isLastMonthOfYear && <StyledYear> {year}</StyledYear>}
                    </>
                  }
                />
              </StyledTitleContainer>
              {/* 🎯 EXISTING CalendarMonthCard - HIỂN THỊ GIỐNG Y CHANG */}
              <CalendarMonthCard dayTimes={monthDayTimes} />
            </Section>
          );
        })}
        
        {/* 🎯 EXISTING PAGINATION - GIỮ NGUYÊN */}
        <CustomResolverFetchMoreLoader
          loading={isFetchingMore || firstQueryLoading}
          onLastRowVisible={handleLastRowVisible}
        />
      </StyledContainer>
    </CalendarContext.Provider>
  );
};
```

### 2.6 🎯 Native Experience: CalendarEventRow Actions

**Yêu cầu**: Local events có thể edit/delete, external events thì không

**File**: `packages/twenty-front/src/modules/activities/calendar/components/CalendarEventRow.tsx`

```typescript
// Thêm imports
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { IconEdit, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

// Thêm styled components
const StyledActionsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
`;

const StyledEventRowContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  
  &:hover ${StyledActionsContainer} {
    opacity: 1;
  }
`;

export const CalendarEventRow = ({ calendarEvent, className }) => {
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
  });

  // 🎯 PHÂN BIỆT LOCAL VS EXTERNAL EVENTS
  const isLocalEvent = calendarEvent._isLocalEvent === true;

  const handleEdit = () => {
    if (isLocalEvent) {
      openRecordInCommandMenu({
        recordId: calendarEvent.id,
        objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
      });
    }
  };

  const handleDelete = async () => {
    if (isLocalEvent && confirm('Are you sure you want to delete this event?')) {
      await deleteOneRecord(calendarEvent.id);
    }
  };

  // 🎯 EXISTING LOGIC GIỮ NGUYÊN
  const startsAt = getCalendarEventStartDate(calendarEvent);
  const endsAt = getCalendarEventEndDate(calendarEvent);
  const hasEnded = hasCalendarEventEnded(calendarEvent);
  // ... rest of existing logic

  return (
    <StyledEventRowContainer className={className}>
      {/* 🎯 EXISTING EVENT DISPLAY - ZERO CHANGES */}
      <StyledContainer
        showTitle={showTitle}
        onClick={
          showTitle && !isLocalEvent
            ? () => openCalendarEventInCommandMenu(calendarEvent.id)
            : isLocalEvent
            ? handleEdit
            : undefined
        }
      >
        <StyledAttendanceIndicator active={isCurrentWorkspaceMemberAttending} />
        <StyledLabels>
          <StyledTime>
            {startTimeLabel}
            {endTimeLabel && (
              <>
                <IconArrowRight size={theme.icon.size.sm} />
                {endTimeLabel}
              </>
            )}
          </StyledTime>
          {showTitle ? (
            <StyledTitle active={!hasEnded} canceled={!!calendarEvent.isCanceled}>
              {calendarEvent.title}
            </StyledTitle>
          ) : (
            <CalendarEventNotSharedContent />
          )}
        </StyledLabels>
        {!!calendarEvent.participants?.length && (
          <CalendarEventParticipantsAvatarGroup
            participants={calendarEvent.participants}
          />
        )}
      </StyledContainer>

      {/* 🎯 ACTIONS CHỈ CHO LOCAL EVENTS */}
      {isLocalEvent && (
        <StyledActionsContainer>
          <LightIconButton
            Icon={IconEdit}
            size="small"
            onClick={handleEdit}
          />
          <LightIconButton
            Icon={IconTrash}
            size="small"
            onClick={handleDelete}
          />
        </StyledActionsContainer>
      )}
    </StyledEventRowContainer>
  );
};
```

## Phase 3: Database Migration

### 3.1 Migration Script

**File**: `packages/twenty-server/src/database/migrations/YYYYMMDDHHMMSS-add-local-calendar-fields.ts`

```typescript
export class AddLocalCalendarFields implements MigrationInterface {
  name = 'AddLocalCalendarFields';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm sourceType column
    await queryRunner.addColumn('calendarEvent', new TableColumn({
      name: 'sourceType',
      type: 'varchar',
      default: "'GOOGLE'",
      isNullable: false,
    }));

    // Thêm creatorId column
    await queryRunner.addColumn('calendarEvent', new TableColumn({
      name: 'creatorId',
      type: 'uuid',
      isNullable: true,
    }));

    // Cập nhật existing records
    await queryRunner.query(`
      UPDATE "calendarEvent" 
      SET "sourceType" = CASE 
        WHEN "externalId" LIKE 'google_%' THEN 'GOOGLE'
        WHEN "externalId" LIKE 'microsoft_%' THEN 'MICROSOFT'
        ELSE 'GOOGLE'
      END
    `);

    // Make externalId nullable
    await queryRunner.changeColumn('calendarEvent', 'externalId', new TableColumn({
      name: 'externalId',
      type: 'varchar',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('calendarEvent', 'sourceType');
    await queryRunner.dropColumn('calendarEvent', 'creatorId');
  }
}
```

## Phase 4: Testing

### 4.1 Unit Tests

**Backend Tests**:
```typescript
// timeline-calendar-event.service.spec.ts
describe('TimelineCalendarEventService', () => {
  describe('createCalendarEvent', () => {
    it('should create local calendar event', async () => {
      // Test implementation
    });
    
    it('should link event to targetable object', async () => {
      // Test implementation
    });
  });
  
  describe('updateCalendarEvent', () => {
    it('should only allow creator to update local events', async () => {
      // Test implementation
    });
  });
});
```

**Frontend Tests**:
```typescript
// useOpenCreateCalendarEventDrawer.test.ts
describe('useOpenCreateCalendarEventDrawer', () => {
  it('should create calendar event and open in command menu', async () => {
    // Test implementation
  });
});
```

### 4.2 Integration Tests

```typescript
// calendar-event-local.integration.spec.ts
describe('Calendar Event Local Integration', () => {
  it('should create, update, and delete local calendar event', async () => {
    // Full flow test
  });
});
```

### 4.3 E2E Tests

```typescript
// calendar-local-events.e2e.ts
test('Create local calendar event from person page', async ({ page }) => {
  // 1. Navigate to person page
  // 2. Go to Calendar tab
  // 3. Click "Add event" button
  // 4. Fill form in command menu
  // 5. Save and verify event appears
});
```

## Implementation Timeline

### Week 1: Backend Foundation
- [ ] Cập nhật CalendarEvent entity
- [ ] Tạo GraphQL mutations và DTOs
- [ ] Implement service layer methods
- [ ] Database migration
- [ ] Unit tests cho backend

### Week 2: Frontend Core
- [ ] Tạo GraphQL mutations
- [ ] Implement useOpenCreateCalendarEventDrawer hook
- [ ] Cập nhật Calendar component với create button
- [ ] Basic create flow testing

### Week 3: Enhanced UI
- [ ] Cập nhật CalendarEventRow với edit/delete actions
- [ ] Visual indicators cho local events
- [ ] Permission checks
- [ ] Error handling và loading states

### Week 4: Testing & Polish
- [ ] Integration tests
- [ ] E2E tests
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Documentation

## Risk Mitigation

### High Priority Risks
1. **Breaking existing calendar import**: 
   - Giải pháp: Comprehensive testing của import flow
   - Backup database trước migration

2. **Permission conflicts**:
   - Giải pháp: Careful permission checking trong mutations
   - Unit tests cho permission scenarios

3. **Data consistency**:
   - Giải pháp: Transaction handling trong service layer
   - Validation ở multiple layers

### Medium Priority Risks
1. **UI performance với nhiều events**:
   - Giải pháp: Pagination và virtualization
   - Performance monitoring

2. **Command Menu UX**:
   - Giải pháp: Custom form fields cho calendar events
   - User testing và feedback

## Success Metrics

- [ ] Users có thể tạo local calendar events
- [ ] Events hiển thị correctly trong calendar view
- [ ] Edit/delete functionality hoạt động
- [ ] Không break existing import functionality
- [ ] Performance không bị impact
- [ ] Test coverage > 80%

## Future Enhancements

### Phase 5: Advanced Features
- Recurring events
- Event reminders/notifications
- Bulk operations
- Calendar view improvements (week/day view)

### Phase 6: Sync Integration
- Two-way sync với Google/Microsoft
- Conflict resolution
- Sync status indicators

---

*Tài liệu này sẽ được cập nhật theo tiến độ implementation.*