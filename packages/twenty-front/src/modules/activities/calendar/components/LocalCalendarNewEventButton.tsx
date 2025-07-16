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
  // Use existing permission system for LocalCalendarEvent
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
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
