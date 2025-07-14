# Twenty CRM - Notification System Implementation Plan

## Overview
This document outlines the complete implementation plan for adding a comprehensive notification system to Twenty CRM, including both UI components and backend infrastructure for Daily Digest and Task Assignment notifications.

## Phase 1: Foundation Setup (Week 1-2)

### 1.1 Create Documentation Structure
- Create `/docs` folder in project root
- Add this implementation plan document
- Set up documentation standards

### 1.2 Backend Infrastructure - Notification Entity
- Create `notification.workspace-entity.ts` in `/packages/twenty-server/src/modules/notification/standard-objects/`
- Fields: id, type, title, content, entityId, entityType, actorId, workspaceMemberId, isRead, createdAt, metadata
- Add proper relations to existing entities (Task, Company, Person, etc.)

### 1.3 Notification Service Infrastructure
- Create `NotificationService` in `/packages/twenty-server/src/modules/notification/services/`
- Create `NotificationRepository` for database operations
- Create `NotificationQueueService` for async processing
- Create `NotificationPreferenceService` for user preferences

### 1.4 Email Infrastructure Extension
- Extend existing email service for notification delivery
- Create notification email templates
- Add notification-specific email job processing

## Phase 2: UI Components (Week 2-3)

### 2.1 Notification Center Modal
**Files to create:**
- `/packages/twenty-front/src/modules/notification/components/NotificationCenter.tsx`
- `/packages/twenty-front/src/modules/notification/components/NotificationPanel.tsx`
- `/packages/twenty-front/src/modules/notification/components/NotificationCard.tsx`
- `/packages/twenty-front/src/modules/notification/components/NotificationTabs.tsx`
- `/packages/twenty-front/src/modules/notification/components/NotificationEmptyState.tsx`

**Component Structure:**
```typescript
// NotificationCenter.tsx - Main modal component
export const NotificationCenter = () => {
  // Use existing Modal component
  // Tab system for "Notifications" and "Requests"
  // Notification cards list
  // Empty state handling
  // Settings button integration
};

// NotificationCard.tsx - Individual notification item
export const NotificationCard = ({ notification }) => {
  // Icon based on notification type
  // Title and content
  // Timestamp
  // Read/unread state
  // Click handlers
};
```

### 2.2 Navigation Integration
**Files to modify:**
- `/packages/twenty-front/src/modules/ui/navigation/navigation-drawer/components/AppNavigationDrawer.tsx`
- Add notification bell icon with badge count
- Integration with NotificationCenter modal

### 2.3 Settings Page for Notifications
**Files to create:**
- `/packages/twenty-front/src/pages/settings/notifications/SettingsNotifications.tsx`
- `/packages/twenty-front/src/modules/settings/notifications/components/NotificationPreferences.tsx`
- `/packages/twenty-front/src/modules/settings/notifications/components/NotificationChannels.tsx`

**Files to modify:**
- `/packages/twenty-front/src/modules/types/SettingsPath.ts` - Add `Notifications = 'notifications'`
- `/packages/twenty-front/src/modules/settings/hooks/useSettingsNavigationItems.tsx` - Add notification nav item
- `/packages/twenty-front/src/pages/settings/SettingsRoutes.tsx` - Add notification route

## Phase 3: Daily Digest Implementation (Week 3-4)

### 3.1 Daily Digest Service
**Files to create:**
- `/packages/twenty-server/src/modules/notification/services/daily-digest.service.ts`
- `/packages/twenty-server/src/modules/notification/jobs/daily-digest.job.ts`
- `/packages/twenty-server/src/modules/notification/cron/daily-digest.cron.ts`

**Implementation Details:**
```typescript
// daily-digest.service.ts
@Injectable()
export class DailyDigestService {
  async generateDailyDigest(workspaceMemberId: string): Promise<DigestData> {
    // Query overdue tasks
    const overdueTasks = await this.taskRepository.find({
      where: { 
        assigneeId: workspaceMemberId,
        dueAt: LessThan(new Date()),
        status: Not('DONE')
      }
    });

    // Query due today tasks
    const dueTodayTasks = await this.taskRepository.find({
      where: { 
        assigneeId: workspaceMemberId,
        dueAt: Between(startOfDay(new Date()), endOfDay(new Date())),
        status: Not('DONE')
      }
    });

    return { overdueTasks, dueTodayTasks };
  }

  async shouldSendDigest(workspaceMemberId: string): Promise<boolean> {
    // Check user preferences
    // Check if there are tasks to report
    // Check if already sent today
  }
}
```

### 3.2 Email Templates
**Files to create:**
- `/packages/twenty-server/src/modules/notification/templates/daily-digest.email.template.ts`
- `/packages/twenty-server/src/modules/notification/templates/task-assignment.email.template.ts`

### 3.3 Cron Job Integration
**Files to modify:**
- `/packages/twenty-server/src/engine/core-modules/cron/cron.module.ts` - Add daily digest cron
- Set up daily execution (e.g., 8 AM local time per user)

## Phase 4: Task Assignment Notifications (Week 4-5)

### 4.1 Event Listeners
**Files to create:**
- `/packages/twenty-server/src/modules/notification/listeners/task-assignment.listener.ts`
- `/packages/twenty-server/src/modules/notification/listeners/notification-event.listener.ts`

**Implementation:**
```typescript
// task-assignment.listener.ts
@Injectable()
export class TaskAssignmentListener {
  @OnEvent('task.updated')
  async handleTaskAssignment(payload: ObjectRecordUpdateEvent<TaskWorkspaceEntity>) {
    const { previousRecord, currentRecord } = payload;
    
    // Check if assignee changed
    if (previousRecord.assigneeId !== currentRecord.assigneeId && currentRecord.assigneeId) {
      await this.notificationService.createNotification({
        type: 'task_assignment',
        workspaceMemberId: currentRecord.assigneeId,
        title: `Task assigned: ${currentRecord.title}`,
        content: `You have been assigned a new task`,
        entityId: currentRecord.id,
        entityType: 'task',
        actorId: payload.userId
      });
    }
  }
}
```

### 4.2 Real-time Updates
**Files to create:**
- `/packages/twenty-server/src/modules/notification/gateways/notification.gateway.ts`
- WebSocket integration for real-time notifications

**Files to modify:**
- `/packages/twenty-front/src/modules/notification/hooks/useNotificationSubscription.ts`
- Real-time notification updates

## Phase 5: Advanced Features (Week 5-6)

### 5.1 Notification Preferences
**Backend Extensions:**
- Extend `WorkspaceMemberWorkspaceEntity` with notification preferences
- Add preference validation and default values
- Create preference update APIs

**Frontend Components:**
- Toggle components for different notification types
- Email delivery frequency settings
- In-app notification preferences

### 5.2 Notification History and Persistence
**Files to create:**
- `/packages/twenty-server/src/modules/notification/repositories/notification.repository.ts`
- `/packages/twenty-server/src/modules/notification/services/notification-history.service.ts`

### 5.3 Mention System (@mentions)
**Files to create:**
- `/packages/twenty-server/src/modules/notification/services/mention-parser.service.ts`
- `/packages/twenty-server/src/modules/notification/listeners/mention.listener.ts`

## Phase 6: Testing and Polish (Week 6-7)

### 6.1 Unit Tests
- Service layer tests for all notification services
- Repository tests for data operations
- Component tests for UI components

### 6.2 Integration Tests
- End-to-end notification flow tests
- Email delivery tests
- WebSocket notification tests

### 6.3 Performance Optimization
- Database query optimization
- Notification queue performance
- UI rendering optimization

## Technical Implementation Details

### Database Schema Changes
```sql
-- Add notification preferences to workspace_member
ALTER TABLE workspace_member ADD COLUMN notification_preferences JSONB DEFAULT '{}';

-- Create notification table
CREATE TABLE notification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  entity_id UUID,
  entity_type VARCHAR(50),
  actor_id UUID,
  workspace_member_id UUID NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  workspace_id UUID NOT NULL
);

-- Add indexes
CREATE INDEX idx_notification_workspace_member ON notification(workspace_member_id);
CREATE INDEX idx_notification_created_at ON notification(created_at);
CREATE INDEX idx_notification_unread ON notification(workspace_member_id, is_read);
```

### GraphQL Schema Extensions
```graphql
type Notification {
  id: ID!
  type: NotificationType!
  title: String!
  content: String
  entityId: ID
  entityType: String
  actor: WorkspaceMember
  isRead: Boolean!
  metadata: JSON
  createdAt: DateTime!
}

enum NotificationType {
  TASK_ASSIGNMENT
  DAILY_DIGEST
  MENTION
  WORKFLOW_UPDATE
}

type NotificationPreferences {
  dailyDigest: Boolean!
  taskAssignments: NotificationChannelPreference!
  mentions: NotificationChannelPreference!
  workflowUpdates: NotificationChannelPreference!
}

type NotificationChannelPreference {
  email: Boolean!
  inApp: Boolean!
}

extend type Query {
  notifications(first: Int, after: String): NotificationConnection!
  notificationPreferences: NotificationPreferences!
}

extend type Mutation {
  markNotificationAsRead(id: ID!): Notification!
  markAllNotificationsAsRead: Boolean!
  updateNotificationPreferences(preferences: NotificationPreferencesInput!): NotificationPreferences!
}
```

### Component Reuse Strategy
- **Modal**: Use existing `Modal` component for notification center
- **Tabs**: Use existing `TabList` component for notification categories
- **Cards**: Use existing card patterns for notification items
- **Settings**: Use existing `SettingsCard` and `SettingsOptionCardContentToggle` patterns
- **Forms**: Use existing form components for preference settings
- **Navigation**: Extend existing navigation patterns

### API Integration Points
- **Email Service**: Leverage existing email infrastructure
- **Event System**: Use existing ObjectRecord events
- **Timeline**: Integration with existing timeline activity system
- **User Management**: Use existing workspace member system
- **Webhooks**: Optional webhook integration for external notifications

## Success Metrics
- Daily digest open rates
- Task assignment notification effectiveness
- User engagement with notification center
- Preference customization adoption
- System performance impact

## Deployment Strategy
- Feature flags for gradual rollout
- A/B testing for notification content
- Monitoring and alerting for notification delivery
- Performance monitoring for queue processing

## Future Enhancements
- Push notifications for mobile
- Slack/Teams integrations
- Advanced filtering and categorization
- Notification analytics and insights
- Smart notification scheduling
- Notification templates customization