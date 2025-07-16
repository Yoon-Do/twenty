import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { v4 } from 'uuid';

// Pattern similar to useCreateNewIndexRecord - LEVERAGE EXISTING SYSTEM
export const useCreateNewLocalCalendarEvent = () => {
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
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
    
    // Create local calendar event with default values
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
      ...relationField, // Link with person or company
      ...recordInput,
    });

    // Open in Command Menu to edit (existing pattern)
    openRecordInCommandMenu({
      recordId,
      objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
      isNewRecord: true,
    });
  };

  return { createNewLocalCalendarEvent };
};
