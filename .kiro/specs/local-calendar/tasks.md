# Implementation Plan

- [ ] 1. Create LocalCalendarEvent WorkspaceEntity
  - Create the LocalCalendarEventWorkspaceEntity class with all required fields and relations
  - Add proper decorators for WorkspaceEntity, WorkspaceField, and WorkspaceRelation
  - Include validation and default values for boolean fields
  - _Requirements: 1.1, 5.1, 6.1, 7.1_

- [ ] 2. Update Core Object Name Enums
  - Add LocalCalendarEvent to CoreObjectNameSingular enum
  - Add LocalCalendarEvent to CoreObjectNamePlural enum  
  - Ensure consistent naming across frontend and backend
  - _Requirements: 5.1_

- [ ] 3. Implement useCreateNewLocalCalendarEvent Hook
  - Create hook following useCreateNewIndexRecord pattern
  - Integrate with useCreateOneRecord for LocalCalendarEvent entity
  - Implement openRecordInCommandMenu integration for editing
  - Add proper default values for new events (title, timing, relations)
  - _Requirements: 1.2, 1.4, 6.1, 6.2_

- [ ] 4. Create LocalCalendarNewEventButton Component
  - Implement button component following RecordBoardColumnNewRecordButton pattern
  - Integrate permission checking using useObjectPermissionsForObject
  - Add proper styling with theme-based spacing and colors
  - Support different sizes and variants for various contexts
  - _Requirements: 1.2, 4.1_

- [ ] 5. Implement useUnifiedCalendarEvents Hook
  - Create hook that merges local and external calendar events
  - Use useFindManyRecords for local events with proper filtering
  - Transform local events to TimelineCalendarEvent format
  - Implement proper sorting and merging logic for unified display
  - Add _isLocalEvent flag for UI differentiation
  - _Requirements: 3.1, 3.2, 3.4, 5.4_

- [ ] 6. Update Calendar Component with Create Button
  - Add LocalCalendarNewEventButton to Calendar component header
  - Update empty state to include create button
  - Integrate with useUnifiedCalendarEvents hook
  - Maintain existing calendar display logic without changes
  - Add proper styled components for header layout
  - _Requirements: 1.1, 1.2, 3.1_

- [ ] 7. Enhance CalendarEventRow with Edit/Delete Actions
  - Add edit and delete action buttons for local events only
  - Implement hover states and proper styling for actions
  - Integrate with useOpenRecordInCommandMenu for editing
  - Add useDeleteOneRecord integration for deletion
  - Include confirmation dialog for delete operations
  - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [ ] 8. Add Permission Validation Logic
  - Implement creator ownership validation for edit/delete operations
  - Add permission checks in useCreateNewLocalCalendarEvent hook
  - Ensure LocalCalendarNewEventButton respects create permissions
  - Add proper error handling for permission denied scenarios
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 9. Implement Event Transformation Logic
  - Create transformation function from LocalCalendarEvent to TimelineCalendarEvent
  - Handle all required fields including visibility, conference links, participants
  - Ensure proper __typename assignment for GraphQL compatibility
  - Add proper null/undefined handling for optional fields
  - _Requirements: 3.3, 5.4_

- [ ] 10. Add Form Validation and Error Handling
  - Implement client-side validation for event creation/editing
  - Add proper error messages for validation failures
  - Handle network errors with retry mechanisms
  - Add loading states for all async operations
  - Implement proper error boundaries for calendar components
  - _Requirements: 7.4_

- [ ] 11. Create Unit Tests for Backend Entity
  - Write tests for LocalCalendarEventWorkspaceEntity field validation
  - Test relationship constraints and cascade behavior
  - Verify auto-generated GraphQL operations work correctly
  - Test permission integration with workspace security
  - _Requirements: 1.1, 4.5, 5.1, 6.1_

- [ ] 12. Create Unit Tests for Frontend Hooks
  - Test useCreateNewLocalCalendarEvent hook functionality
  - Test useUnifiedCalendarEvents event merging and sorting
  - Verify permission checking in LocalCalendarNewEventButton
  - Test event transformation logic with various input scenarios
  - _Requirements: 1.2, 3.2, 4.1_

- [ ] 13. Create Integration Tests for Calendar Flow
  - Test complete create event flow from button click to database save
  - Test edit event flow with command menu integration
  - Test delete event flow with confirmation and database removal
  - Verify unified calendar display with mixed local/external events
  - _Requirements: 1.1, 2.1, 2.3, 3.1_

- [ ] 14. Add E2E Tests for User Workflows
  - Test creating calendar event from Person record calendar tab
  - Test creating calendar event from Company record calendar tab
  - Test editing local calendar event through click interaction
  - Test deleting local calendar event with confirmation
  - Verify external events cannot be edited/deleted
  - _Requirements: 1.1, 2.1, 2.5, 6.1, 6.2_

- [ ] 15. Optimize Performance and Add Caching
  - Add database indexes for startsAt, personId, companyId fields
  - Implement useMemo for expensive event transformation operations
  - Add React.memo optimization for CalendarEventRow component
  - Optimize GraphQL queries with proper field selection
  - _Requirements: 3.4_

- [ ] 16. Add Comprehensive Error Handling
  - Implement proper error boundaries for calendar components
  - Add user-friendly error messages for all failure scenarios
  - Handle concurrent update conflicts with optimistic locking
  - Add retry mechanisms for network failures
  - Implement proper loading states throughout the UI
  - _Requirements: 7.4_

- [ ] 17. Create Component Documentation and Stories
  - Write Storybook stories for LocalCalendarNewEventButton component
  - Document useCreateNewLocalCalendarEvent hook usage
  - Create examples for useUnifiedCalendarEvents hook
  - Add JSDoc comments for all public APIs
  - _Requirements: All requirements for maintainability_

- [ ] 18. Perform Security Review and Validation
  - Review permission model implementation for security gaps
  - Validate input sanitization for XSS prevention
  - Test workspace isolation for multi-tenant security
  - Verify creator ownership validation cannot be bypassed
  - Review database constraints and foreign key relationships
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_