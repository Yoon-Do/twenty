import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useCreateNewLocalCalendarEvent } from '@/activities/calendar/hooks/useCreateNewLocalCalendarEvent';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { IconPlus } from 'twenty-ui/display';
import { Button, ButtonProps } from 'twenty-ui/input';

export const LocalCalendarNewEventButton = ({
  targetableObject,
  ...buttonProps
}: {
  targetableObject: ActivityTargetableObject;
} & Omit<ButtonProps, 'onClick' | 'Icon' | 'title'>) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
  });

  const objectPermissions = useObjectPermissionsForObject(objectMetadataItem.id);

  const { createNewLocalCalendarEvent } = useCreateNewLocalCalendarEvent();

  if (!objectPermissions.canCreateObjectRecords) {
    return null;
  }

  return (
    <Button
      Icon={IconPlus}
      title="New event"
      variant="secondary"
      size="small"
      onClick={() =>
        createNewLocalCalendarEvent({ targetableObject })
      }
      {...buttonProps}
    />
  );
};
