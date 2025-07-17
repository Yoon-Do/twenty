import { useRecoilCallback } from 'recoil';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { v4 } from 'uuid';

export const useCreateNewLocalCalendarEvent = () => {
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
    shouldMatchRootQueryFilter: true,
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const createNewLocalCalendarEvent = useRecoilCallback(
    () =>
      async ({
        targetableObject,
        recordInput,
      }: {
        targetableObject: ActivityTargetableObject;
        recordInput?: Partial<ObjectRecord>;
      }) => {
        const recordId = v4();

        const relationFieldName =
          targetableObject.targetObjectNameSingular === 'person'
            ? 'personId'
            : 'companyId';

        await createOneRecord({
          id: recordId,
          title: 'Untitled Event',
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          isFullDay: false,
          isCanceled: false,
          [relationFieldName]: targetableObject.id,
          ...recordInput,
        });

        openRecordInCommandMenu({
          recordId,
          objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
          isNewRecord: true,
        });
      },
    [createOneRecord, openRecordInCommandMenu],
  );

  return { createNewLocalCalendarEvent };
};
