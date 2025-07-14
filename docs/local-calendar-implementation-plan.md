# 📅 KẾ HOẠCH THỰC HIỆN CALENDAR LOCAL TỰ TWENTY

## 🎯 MỤC TIÊU

Tạo một calendar local hoàn chỉnh trong Twenty, tách biệt hoàn toàn khỏi external providers (Google Calendar, Microsoft Calendar), cho phép users tạo và quản lý events riêng của mình trực tiếp trong hệ thống.

## 🔍 PHÂN TÍCH HIỆN TRẠNG

### Hệ thống Calendar hiện tại

Twenty hiện tại có một hệ thống calendar rất mạnh mẽ với các đặc điểm:

**Ưu điểm:**
- Tích hợp tốt với Google Calendar và Microsoft Calendar
- Sync tự động với external providers
- UI/UX calendar timeline rất đẹp và intuitive
- Database schema hoàn chỉnh cho calendar events
- Permission system và privacy controls tốt
- Performance tối ưu với pagination và caching

**Hạn chế:**
- **Không thể tạo events mới**: Chỉ có thể view events từ external providers
- **Dependency**: Phụ thuộc hoàn toàn vào external accounts
- **Limited control**: Không thể customize event properties riêng
- **No native events**: Không có events thuộc về Twenty

### Yêu cầu cho Calendar Local

**Core Requirements:**
1. **Native Event Creation**: Tạo events trực tiếp trong Twenty
2. **Full CRUD Operations**: Create, Read, Update, Delete events
3. **Participant Management**: Thêm/xóa participants, response tracking
4. **Event Types**: Support all-day events, recurring events, reminders
5. **Integration**: Seamless với existing calendar timeline
6. **Privacy**: Event visibility controls
7. **Notifications**: Email notifications và in-app reminders

## 🏗️ KIẾN TRÚC TECHNICAL

### Database Schema Design

#### 1. Extend CalendarEventWorkspaceEntity
```typescript
// Add new fields to existing entity
export class CalendarEventWorkspaceEntity {
  // ... existing fields
  
  @WorkspaceField({
    standardId: CALENDAR_EVENT_FIELD_STANDARD_IDS.isLocalEvent,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Local Event',
    description: 'Whether this event was created locally in Twenty',
    defaultValue: false,
  })
  isLocalEvent: boolean;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_FIELD_STANDARD_IDS.recurrenceRule,
    type: FieldMetadataType.TEXT,
    label: 'Recurrence Rule',
    description: 'RRULE for recurring events',
  })
  recurrenceRule: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_FIELD_STANDARD_IDS.reminderSettings,
    type: FieldMetadataType.RAW_JSON,
    label: 'Reminder Settings',
    description: 'JSON settings for event reminders',
  })
  reminderSettings: ReminderSettings | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_FIELD_STANDARD_IDS.createdByWorkspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'Created By',
    description: 'Workspace member who created this event',
  })
  createdByWorkspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;
}
```

#### 2. New Entity: LocalCalendarWorkspaceEntity
```typescript
@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.localCalendar,
  namePlural: 'localCalendars',
  labelSingular: 'Local Calendar',
  labelPlural: 'Local Calendars',
})
export class LocalCalendarWorkspaceEntity {
  @WorkspaceField({
    standardId: LOCAL_CALENDAR_FIELD_STANDARD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Calendar name',
  })
  name: string;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_FIELD_STANDARD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: 'Description',
    description: 'Calendar description',
  })
  description: string;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_FIELD_STANDARD_IDS.color,
    type: FieldMetadataType.TEXT,
    label: 'Color',
    description: 'Calendar color for UI',
  })
  color: string;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_FIELD_STANDARD_IDS.isDefault,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Default',
    description: 'Whether this is the default calendar',
  })
  isDefault: boolean;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_FIELD_STANDARD_IDS.owner,
    type: FieldMetadataType.RELATION,
    label: 'Owner',
    description: 'Owner of this calendar',
  })
  owner: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceField({
    standardId: LOCAL_CALENDAR_FIELD_STANDARD_IDS.events,
    type: FieldMetadataType.RELATION,
    label: 'Events',
    description: 'Events in this calendar',
  })
  events: Relation<CalendarEventWorkspaceEntity[]>;
}
```

#### 3. Supporting Types
```typescript
// Reminder settings
export type ReminderSettings = {
  enableEmailReminders: boolean;
  enableInAppReminders: boolean;
  reminderMinutesBefore: number[];
  customMessage?: string;
};

// Event creation input
export type LocalCalendarEventInput = {
  title: string;
  description?: string;
  location?: string;
  startsAt: Date;
  endsAt: Date;
  isFullDay: boolean;
  recurrenceRule?: string;
  reminderSettings?: ReminderSettings;
  participantEmails?: string[];
  localCalendarId?: string;
};
```

### Backend API Design

#### 1. GraphQL Mutations
```typescript
// Create local calendar event
mutation createLocalCalendarEvent($input: LocalCalendarEventInput!) {
  createLocalCalendarEvent(input: $input) {
    id
    title
    description
    location
    startsAt
    endsAt
    isFullDay
    isLocalEvent
    recurrenceRule
    reminderSettings
    createdByWorkspaceMember {
      id
      name
      avatarUrl
    }
    participants {
      id
      handle
      displayName
      responseStatus
    }
  }
}

// Update local calendar event
mutation updateLocalCalendarEvent($id: UUID!, $input: LocalCalendarEventUpdateInput!) {
  updateLocalCalendarEvent(id: $id, input: $input) {
    id
    title
    # ... same fields as create
  }
}

// Delete local calendar event
mutation deleteLocalCalendarEvent($id: UUID!) {
  deleteLocalCalendarEvent(id: $id) {
    success
  }
}

// Add participant to event
mutation addParticipantToEvent($eventId: UUID!, $participantInput: EventParticipantInput!) {
  addParticipantToEvent(eventId: $eventId, participantInput: $participantInput) {
    id
    handle
    displayName
    responseStatus
  }
}

// Update participant response
mutation updateParticipantResponse($eventId: UUID!, $participantId: UUID!, $responseStatus: ParticipantResponseStatus!) {
  updateParticipantResponse(eventId: $eventId, participantId: $participantId, responseStatus: $responseStatus) {
    id
    responseStatus
  }
}
```

#### 2. GraphQL Queries
```typescript
// Get local calendars
query getLocalCalendars {
  localCalendars {
    id
    name
    description
    color
    isDefault
    owner {
      id
      name
    }
    events {
      id
      title
      startsAt
      endsAt
    }
  }
}

// Get local calendar events with filters
query getLocalCalendarEvents($filter: LocalCalendarEventFilter) {
  localCalendarEvents(filter: $filter) {
    id
    title
    description
    location
    startsAt
    endsAt
    isFullDay
    participants {
      id
      handle
      displayName
      responseStatus
    }
  }
}
```

#### 3. Services Architecture
```typescript
// Core service for local calendar operations
@Injectable()
export class LocalCalendarEventService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly localCalendarValidationService: LocalCalendarValidationService,
    private readonly localCalendarNotificationService: LocalCalendarNotificationService,
    private readonly localCalendarRecurrenceService: LocalCalendarRecurrenceService,
  ) {}

  async createLocalCalendarEvent(input: LocalCalendarEventInput, workspaceId: string, createdBy: string) {
    // Validation
    await this.localCalendarValidationService.validateEventInput(input);
    
    // Check for conflicts
    const hasConflict = await this.checkTimeConflicts(input, workspaceId);
    if (hasConflict) {
      throw new ConflictException('Event time conflicts with existing events');
    }

    // Create event
    const event = await this.createEvent(input, workspaceId, createdBy);
    
    // Handle participants
    if (input.participantEmails?.length) {
      await this.addParticipantsToEvent(event.id, input.participantEmails, workspaceId);
    }
    
    // Handle recurrence
    if (input.recurrenceRule) {
      await this.localCalendarRecurrenceService.createRecurringEvents(event, input.recurrenceRule);
    }
    
    // Schedule notifications
    if (input.reminderSettings?.enableEmailReminders || input.reminderSettings?.enableInAppReminders) {
      await this.localCalendarNotificationService.scheduleReminders(event);
    }
    
    return event;
  }

  async updateLocalCalendarEvent(id: string, input: LocalCalendarEventUpdateInput, workspaceId: string) {
    // Validation
    const event = await this.findEventById(id, workspaceId);
    if (!event.isLocalEvent) {
      throw new ForbiddenException('Cannot update external calendar events');
    }
    
    // Update event
    const updatedEvent = await this.updateEvent(id, input, workspaceId);
    
    // Handle participant changes
    if (input.participantEmails) {
      await this.updateEventParticipants(id, input.participantEmails, workspaceId);
    }
    
    // Update recurrence if needed
    if (input.recurrenceRule !== undefined) {
      await this.localCalendarRecurrenceService.updateRecurringEvents(updatedEvent, input.recurrenceRule);
    }
    
    // Update notifications
    if (input.reminderSettings) {
      await this.localCalendarNotificationService.updateReminders(updatedEvent);
    }
    
    return updatedEvent;
  }
}

// Validation service
@Injectable()
export class LocalCalendarValidationService {
  async validateEventInput(input: LocalCalendarEventInput) {
    // Required fields
    if (!input.title?.trim()) {
      throw new BadRequestException('Event title is required');
    }
    
    // Date validation
    if (input.startsAt >= input.endsAt) {
      throw new BadRequestException('Event start time must be before end time');
    }
    
    // Full day events validation
    if (input.isFullDay) {
      // Full day events should be at start of day
      const startOfDay = new Date(input.startsAt);
      startOfDay.setHours(0, 0, 0, 0);
      
      if (input.startsAt.getTime() !== startOfDay.getTime()) {
        throw new BadRequestException('Full day events must start at beginning of day');
      }
    }
    
    // Participant email validation
    if (input.participantEmails?.length) {
      for (const email of input.participantEmails) {
        if (!this.isValidEmail(email)) {
          throw new BadRequestException(`Invalid email format: ${email}`);
        }
      }
    }
    
    // Recurrence rule validation
    if (input.recurrenceRule) {
      if (!this.isValidRRule(input.recurrenceRule)) {
        throw new BadRequestException('Invalid recurrence rule format');
      }
    }
  }
  
  async checkTimeConflicts(input: LocalCalendarEventInput, workspaceId: string): Promise<boolean> {
    // Check for overlapping events for the same participants
    // Implementation depends on business rules
    return false;
  }
}

// Notification service
@Injectable()
export class LocalCalendarNotificationService {
  async scheduleReminders(event: CalendarEventWorkspaceEntity) {
    if (!event.reminderSettings) return;
    
    const { enableEmailReminders, enableInAppReminders, reminderMinutesBefore } = event.reminderSettings;
    
    for (const minutesBefore of reminderMinutesBefore) {
      const reminderTime = new Date(event.startsAt);
      reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);
      
      if (enableEmailReminders) {
        await this.scheduleEmailReminder(event, reminderTime);
      }
      
      if (enableInAppReminders) {
        await this.scheduleInAppReminder(event, reminderTime);
      }
    }
  }
  
  private async scheduleEmailReminder(event: CalendarEventWorkspaceEntity, reminderTime: Date) {
    // Schedule email reminder using existing email service
    // Implementation depends on email queue system
  }
  
  private async scheduleInAppReminder(event: CalendarEventWorkspaceEntity, reminderTime: Date) {
    // Schedule in-app notification
    // Implementation depends on notification system
  }
}

// Recurrence service
@Injectable()
export class LocalCalendarRecurrenceService {
  async createRecurringEvents(baseEvent: CalendarEventWorkspaceEntity, recurrenceRule: string) {
    // Parse RRULE and create recurring events
    // Use library like 'rrule' to parse and generate dates
    const rule = RRule.fromString(recurrenceRule);
    const occurrences = rule.all();
    
    for (const occurrence of occurrences.slice(1)) { // Skip first occurrence (base event)
      const recurringEvent = {
        ...baseEvent,
        id: undefined, // Generate new ID
        startsAt: occurrence,
        endsAt: new Date(occurrence.getTime() + (baseEvent.endsAt.getTime() - baseEvent.startsAt.getTime())),
        recurrenceRule: null, // Only base event has recurrence rule
      };
      
      await this.createEvent(recurringEvent);
    }
  }
}
```

### Frontend Implementation

#### 1. Components Architecture
```typescript
// Main calendar component extension
export const Calendar = ({ targetableObject }: { targetableObject: ActivityTargetableObject }) => {
  // ... existing code for external events
  
  // Add local events to the mix
  const { localCalendarEvents } = useLocalCalendarEvents();
  
  // Merge external and local events
  const allEvents = useMemo(() => {
    return [...(timelineCalendarEvents || []), ...localCalendarEvents];
  }, [timelineCalendarEvents, localCalendarEvents]);
  
  return (
    <CalendarContext.Provider value={{ calendarEventsByDayTime }}>
      <StyledContainer>
        <CalendarHeader>
          <CreateEventButton onClick={() => setShowCreateModal(true)} />
        </CalendarHeader>
        
        {/* Existing calendar rendering */}
        {monthTimes.map((monthTime) => (
          <Section key={monthTime}>
            <H3Title title={<>{monthLabel}{isLastMonthOfYear && <StyledYear> {year}</StyledYear>}</>} />
            <CalendarMonthCard dayTimes={monthDayTimes} />
          </Section>
        ))}
        
        {/* Create event modal */}
        {showCreateModal && (
          <CreateLocalEventModal
            onClose={() => setShowCreateModal(false)}
            onEventCreated={handleEventCreated}
          />
        )}
      </StyledContainer>
    </CalendarContext.Provider>
  );
};

// Create event modal
export const CreateLocalEventModal = ({ onClose, onEventCreated }: CreateLocalEventModalProps) => {
  const [eventData, setEventData] = useState<LocalCalendarEventInput>({
    title: '',
    description: '',
    location: '',
    startsAt: new Date(),
    endsAt: new Date(),
    isFullDay: false,
    participantEmails: [],
  });
  
  const [createEvent, { loading }] = useCreateLocalCalendarEventMutation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createEvent({
        variables: { input: eventData },
        refetchQueries: ['getTimelineCalendarEventsFromPersonId'],
      });
      
      onEventCreated(result.data.createLocalCalendarEvent);
      onClose();
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <Modal isOpen onClose={onClose}>
      <ModalHeader>Create New Event</ModalHeader>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <StyledInputContainer>
            <TextInput
              label="Event Title"
              value={eventData.title}
              onChange={(value) => setEventData(prev => ({ ...prev, title: value }))}
              required
              placeholder="Enter event title"
            />
          </StyledInputContainer>
          
          <StyledInputContainer>
            <TextArea
              label="Description"
              value={eventData.description}
              onChange={(value) => setEventData(prev => ({ ...prev, description: value }))}
              placeholder="Enter event description"
            />
          </StyledInputContainer>
          
          <StyledInputContainer>
            <TextInput
              label="Location"
              value={eventData.location}
              onChange={(value) => setEventData(prev => ({ ...prev, location: value }))}
              placeholder="Enter event location"
            />
          </StyledInputContainer>
          
          <StyledDateTimeContainer>
            <DateTimeInput
              label="Start Date & Time"
              value={eventData.startsAt}
              onChange={(value) => setEventData(prev => ({ ...prev, startsAt: value }))}
              required
            />
            
            <DateTimeInput
              label="End Date & Time"
              value={eventData.endsAt}
              onChange={(value) => setEventData(prev => ({ ...prev, endsAt: value }))}
              required
            />
          </StyledDateTimeContainer>
          
          <StyledCheckboxContainer>
            <Checkbox
              checked={eventData.isFullDay}
              onChange={(checked) => setEventData(prev => ({ ...prev, isFullDay: checked }))}
              label="All Day Event"
            />
          </StyledCheckboxContainer>
          
          <ParticipantSelector
            participants={eventData.participantEmails}
            onChange={(emails) => setEventData(prev => ({ ...prev, participantEmails: emails }))}
          />
          
          <ReminderSettings
            settings={eventData.reminderSettings}
            onChange={(settings) => setEventData(prev => ({ ...prev, reminderSettings: settings }))}
          />
          
          <RecurrenceSettings
            rule={eventData.recurrenceRule}
            onChange={(rule) => setEventData(prev => ({ ...prev, recurrenceRule: rule }))}
          />
        </form>
      </ModalContent>
      <ModalFooter>
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          Create Event
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Enhanced calendar event row for local events
export const CalendarEventRow = ({ calendarEvent, className }: CalendarEventRowProps) => {
  const { openCalendarEventInCommandMenu } = useOpenCalendarEventInCommandMenu();
  const [showEditModal, setShowEditModal] = useState(false);
  
  const handleEventClick = () => {
    if (calendarEvent.isLocalEvent) {
      setShowEditModal(true);
    } else {
      openCalendarEventInCommandMenu(calendarEvent.id);
    }
  };
  
  return (
    <>
      <StyledContainer onClick={handleEventClick}>
        {/* Existing event row content */}
        <StyledAttendanceIndicator active={isCurrentWorkspaceMemberAttending} />
        <StyledLabels>
          <StyledTime>{startTimeLabel}</StyledTime>
          <StyledTitle>{calendarEvent.title}</StyledTitle>
          {calendarEvent.isLocalEvent && <LocalEventBadge />}
        </StyledLabels>
        <CalendarEventParticipantsAvatarGroup participants={calendarEvent.participants} />
        
        {/* Action buttons for local events */}
        {calendarEvent.isLocalEvent && (
          <StyledEventActions>
            <IconButton
              icon={IconEdit}
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
            />
            <IconButton
              icon={IconTrash}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteEvent(calendarEvent.id);
              }}
            />
          </StyledEventActions>
        )}
      </StyledContainer>
      
      {/* Edit modal for local events */}
      {showEditModal && (
        <EditLocalEventModal
          event={calendarEvent}
          onClose={() => setShowEditModal(false)}
          onEventUpdated={handleEventUpdated}
        />
      )}
    </>
  );
};
```

#### 2. Hooks và Utilities
```typescript
// Custom hook for local calendar events
export const useLocalCalendarEvents = () => {
  const { data, loading, error } = useQuery(GET_LOCAL_CALENDAR_EVENTS);
  
  return {
    localCalendarEvents: data?.localCalendarEvents || [],
    loading,
    error,
  };
};

// Custom hook for event mutations
export const useLocalCalendarEventMutations = () => {
  const [createEvent] = useMutation(CREATE_LOCAL_CALENDAR_EVENT);
  const [updateEvent] = useMutation(UPDATE_LOCAL_CALENDAR_EVENT);
  const [deleteEvent] = useMutation(DELETE_LOCAL_CALENDAR_EVENT);
  
  return {
    createEvent,
    updateEvent,
    deleteEvent,
  };
};

// Utility functions
export const mergeCalendarEvents = (externalEvents: TimelineCalendarEvent[], localEvents: LocalCalendarEvent[]): TimelineCalendarEvent[] => {
  const mergedEvents = [...externalEvents, ...localEvents.map(mapLocalEventToTimelineEvent)];
  return sortCalendarEventsAsc(mergedEvents);
};

export const mapLocalEventToTimelineEvent = (localEvent: LocalCalendarEvent): TimelineCalendarEvent => {
  return {
    id: localEvent.id,
    title: localEvent.title,
    description: localEvent.description,
    location: localEvent.location,
    startsAt: localEvent.startsAt,
    endsAt: localEvent.endsAt,
    isFullDay: localEvent.isFullDay,
    isCanceled: false,
    isLocalEvent: true,
    visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
    participants: localEvent.participants,
    conferenceSolution: '',
    conferenceLink: null,
  };
};
```

#### 3. GraphQL Queries và Mutations
```typescript
// GraphQL queries
export const GET_LOCAL_CALENDAR_EVENTS = gql`
  query GetLocalCalendarEvents($filter: LocalCalendarEventFilter) {
    localCalendarEvents(filter: $filter) {
      id
      title
      description
      location
      startsAt
      endsAt
      isFullDay
      isLocalEvent
      recurrenceRule
      reminderSettings {
        enableEmailReminders
        enableInAppReminders
        reminderMinutesBefore
      }
      createdByWorkspaceMember {
        id
        name {
          firstName
          lastName
        }
        avatarUrl
      }
      participants {
        id
        handle
        displayName
        responseStatus
        person {
          id
          name {
            firstName
            lastName
          }
          avatarUrl
        }
        workspaceMember {
          id
          name {
            firstName
            lastName
          }
          avatarUrl
        }
      }
    }
  }
`;

export const CREATE_LOCAL_CALENDAR_EVENT = gql`
  mutation CreateLocalCalendarEvent($input: LocalCalendarEventInput!) {
    createLocalCalendarEvent(input: $input) {
      id
      title
      description
      location
      startsAt
      endsAt
      isFullDay
      isLocalEvent
      participants {
        id
        handle
        displayName
        responseStatus
      }
    }
  }
`;

export const UPDATE_LOCAL_CALENDAR_EVENT = gql`
  mutation UpdateLocalCalendarEvent($id: UUID!, $input: LocalCalendarEventUpdateInput!) {
    updateLocalCalendarEvent(id: $id, input: $input) {
      id
      title
      description
      location
      startsAt
      endsAt
      isFullDay
      participants {
        id
        handle
        displayName
        responseStatus
      }
    }
  }
`;

export const DELETE_LOCAL_CALENDAR_EVENT = gql`
  mutation DeleteLocalCalendarEvent($id: UUID!) {
    deleteLocalCalendarEvent(id: $id) {
      success
    }
  }
`;
```

## 🎨 UI/UX DESIGN

### Design Principles

1. **Consistency**: Sử dụng existing design system của Twenty
2. **Intuitive**: Familiar calendar interaction patterns
3. **Accessible**: Keyboard navigation, screen reader support
4. **Responsive**: Mobile-friendly design
5. **Performance**: Fast loading, smooth interactions

### Key UI Components

#### 1. Create Event Button
```typescript
const CreateEventButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="primary"
    size="small"
    Icon={IconPlus}
    onClick={onClick}
    className="create-event-button"
  >
    Create Event
  </Button>
);
```

#### 2. Local Event Badge
```typescript
const LocalEventBadge = () => (
  <StyledBadge>
    <IconCalendar size={12} />
    <span>Local</span>
  </StyledBadge>
);

const StyledBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: ${({ theme }) => theme.accent.primary};
  color: white;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
`;
```

#### 3. Event Actions
```typescript
const EventActions = ({ event, onEdit, onDelete }: EventActionsProps) => (
  <StyledActions>
    <IconButton
      icon={IconEdit}
      size="small"
      onClick={onEdit}
      tooltip="Edit Event"
    />
    <IconButton
      icon={IconTrash}
      size="small"
      onClick={onDelete}
      tooltip="Delete Event"
      variant="danger"
    />
  </StyledActions>
);
```

### Modal Design

#### Create/Edit Event Modal
- **Clean layout**: Single column form with logical grouping
- **Date/Time picker**: Intuitive date and time selection
- **Participant selector**: Multi-select với email validation
- **Reminder settings**: Toggle switches và time selection
- **Recurrence options**: Dropdown với common patterns

#### Confirmation Dialogs
- **Delete confirmation**: Clear warning with event details
- **Conflict resolution**: Show conflicting events và options
- **Participant notifications**: Confirm before sending invites

## 🔒 SECURITY & PERMISSIONS

### Access Control

1. **Event Ownership**: Only creator can edit/delete local events
2. **Workspace Permissions**: Respect workspace member roles
3. **Participant Privacy**: Participant data based on workspace visibility
4. **Data Validation**: Sanitize all inputs, validate email addresses

### Privacy Controls

```typescript
// Event visibility levels
export enum LocalEventVisibility {
  PRIVATE = 'PRIVATE',           // Only creator can see
  WORKSPACE = 'WORKSPACE',       // All workspace members can see
  PARTICIPANTS = 'PARTICIPANTS', // Only participants can see
  PUBLIC = 'PUBLIC'              // Public within workspace
}

// Permission checks
export const canEditLocalEvent = (event: CalendarEvent, currentUserId: string): boolean => {
  return event.createdByWorkspaceMember?.id === currentUserId;
};

export const canViewLocalEvent = (event: CalendarEvent, currentUserId: string): boolean => {
  switch (event.visibility) {
    case LocalEventVisibility.PRIVATE:
      return event.createdByWorkspaceMember?.id === currentUserId;
    case LocalEventVisibility.PARTICIPANTS:
      return event.participants?.some(p => p.workspaceMemberId === currentUserId);
    case LocalEventVisibility.WORKSPACE:
    case LocalEventVisibility.PUBLIC:
      return true;
    default:
      return false;
  }
};
```

## 📊 PERFORMANCE OPTIMIZATION

### Database Optimization

1. **Indexes**: Composite indexes trên startsAt, endsAt, workspaceId
2. **Query Optimization**: Efficient joins và selective loading
3. **Caching**: Redis cache cho frequently accessed events
4. **Pagination**: Proper pagination cho large event lists

### Frontend Performance

1. **Lazy Loading**: Load events as needed
2. **Memoization**: Cache computed values
3. **Virtual Scrolling**: For large calendar views
4. **Optimistic Updates**: Update UI immediately, sync later

### Caching Strategy

```typescript
// Cache key patterns
export const CacheKeys = {
  LOCAL_EVENTS: (workspaceId: string) => `local-events:${workspaceId}`,
  USER_EVENTS: (userId: string) => `user-events:${userId}`,
  EVENT_CONFLICTS: (eventId: string) => `event-conflicts:${eventId}`,
};

// Cache service
@Injectable()
export class LocalCalendarCacheService {
  async getEventsFromCache(workspaceId: string): Promise<CalendarEvent[]> {
    const cacheKey = CacheKeys.LOCAL_EVENTS(workspaceId);
    return await this.cacheService.get(cacheKey);
  }
  
  async setEventsToCache(workspaceId: string, events: CalendarEvent[]): Promise<void> {
    const cacheKey = CacheKeys.LOCAL_EVENTS(workspaceId);
    await this.cacheService.set(cacheKey, events, 300); // 5 minutes
  }
}
```

## 🧪 TESTING STRATEGY

### Unit Tests

1. **Services**: LocalCalendarEventService, validation logic
2. **Utilities**: Date functions, event merging
3. **Hooks**: useLocalCalendarEvents, mutation hooks
4. **Components**: CreateEventModal, CalendarEventRow

### Integration Tests

1. **API Endpoints**: GraphQL mutations và queries
2. **Database**: Event CRUD operations
3. **External Services**: Email notifications, reminders
4. **UI Flows**: Create event, edit event, delete event

### E2E Tests

1. **Complete Workflows**: Create event → Add participants → Set reminders
2. **Cross-browser**: Chrome, Firefox, Safari
3. **Mobile**: Responsive design testing
4. **Accessibility**: Screen reader, keyboard navigation

## 🚀 DEPLOYMENT STRATEGY

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema extensions
- [ ] Basic CRUD services
- [ ] GraphQL API endpoints
- [ ] Unit tests

### Phase 2: Core Features (Week 3-4)
- [ ] Frontend components
- [ ] Create/Edit event modals
- [ ] Event display integration
- [ ] Basic validation

### Phase 3: Advanced Features (Week 5-6)
- [ ] Participant management
- [ ] Reminder system
- [ ] Recurring events
- [ ] Conflict detection

### Phase 4: Polish & Integration (Week 7-8)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation

### Phase 5: Deployment & Monitoring (Week 9-10)
- [ ] Staging deployment
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Monitoring và metrics

## 📈 SUCCESS METRICS

### Functionality Metrics
- [ ] All CRUD operations work correctly
- [ ] Event creation time < 200ms
- [ ] Zero data loss during operations
- [ ] 100% test coverage cho critical paths

### User Experience Metrics
- [ ] Intuitive event creation (< 30 seconds)
- [ ] Low user error rate (< 5%)
- [ ] High user satisfaction (> 4.5/5)
- [ ] Seamless integration với existing calendar

### Performance Metrics
- [ ] Page load time < 1 second
- [ ] Calendar rendering < 500ms
- [ ] Database queries < 100ms
- [ ] Mobile performance parity

### Business Metrics
- [ ] Increased user engagement
- [ ] Reduced dependency on external providers
- [ ] Higher Twenty retention rate
- [ ] Positive user feedback

## 🔄 MAINTENANCE & FUTURE ENHANCEMENTS

### Phase 2 Features (Future)
1. **Calendar Sharing**: Share calendars between workspace members
2. **External Integration**: Export to iCal, sync with external calendars
3. **Advanced Recurrence**: Complex recurring patterns
4. **Team Calendars**: Department/team-specific calendars
5. **Calendar Templates**: Pre-defined event templates
6. **Advanced Notifications**: SMS, Slack, Teams integration
7. **Calendar Analytics**: Usage statistics và insights

### Monitoring & Alerting
- [ ] Event creation/deletion rates
- [ ] Error rates và types
- [ ] Performance metrics
- [ ] User engagement metrics

### Documentation
- [ ] User guide for calendar features
- [ ] API documentation
- [ ] Developer guide for extensions
- [ ] Troubleshooting guide

## 📋 IMPLEMENTATION CHECKLIST

### Backend Development
- [ ] Database schema design và migration
- [ ] GraphQL resolvers implementation
- [ ] Service layer development
- [ ] Validation logic implementation
- [ ] Error handling và logging
- [ ] Unit tests for services
- [ ] Integration tests for APIs

### Frontend Development
- [ ] Component design và implementation
- [ ] Modal components for CRUD operations
- [ ] Calendar integration và display
- [ ] State management và hooks
- [ ] Form validation và error handling
- [ ] Responsive design implementation
- [ ] Accessibility features
- [ ] Unit tests for components

### Quality Assurance
- [ ] Comprehensive testing strategy
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Accessibility testing

### Deployment
- [ ] Staging environment setup
- [ ] Production deployment plan
- [ ] Monitoring và alerting setup
- [ ] Documentation creation
- [ ] User training materials
- [ ] Rollback procedures

## 📝 CONCLUSION

Kế hoạch này sẽ tạo ra một calendar local hoàn chỉnh cho Twenty, mang lại:

1. **Independence**: Giảm phụ thuộc vào external providers
2. **Control**: Full control over calendar data và features
3. **Integration**: Seamless integration với existing Twenty features
4. **User Experience**: Intuitive và powerful calendar management
5. **Scalability**: Foundation cho future calendar enhancements

Với kiến trúc modular và extensible, hệ thống có thể dễ dàng mở rộng và customize theo nhu cầu specific của Twenty users.