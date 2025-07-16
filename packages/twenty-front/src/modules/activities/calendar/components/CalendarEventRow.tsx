import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import { useRecoilValue } from 'recoil';

import { CalendarEventNotSharedContent } from '@/activities/calendar/components/CalendarEventNotSharedContent';
import { CalendarEventParticipantsAvatarGroup } from '@/activities/calendar/components/CalendarEventParticipantsAvatarGroup';
import { getCalendarEventEndDate } from '@/activities/calendar/utils/getCalendarEventEndDate';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { hasCalendarEventEnded } from '@/activities/calendar/utils/hasCalendarEventEnded';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useOpenCalendarEventInCommandMenu } from '@/command-menu/hooks/useOpenCalendarEventInCommandMenu';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { IconArrowRight, IconEdit, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import {
  CalendarChannelVisibility,
  TimelineCalendarEvent,
} from '~/generated-metadata/graphql';

type CalendarEventRowProps = {
  calendarEvent: TimelineCalendarEvent;
  className?: string;
};

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

const StyledContainer = styled.div<{ showTitle?: boolean }>`
  align-items: center;
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(3)};
  height: ${({ theme }) => theme.spacing(6)};
  position: relative;
  cursor: ${({ showTitle }) => (showTitle ? 'pointer' : 'not-allowed')};
  flex: 1;
`;

const StyledAttendanceIndicator = styled.div<{ active?: boolean }>`
  background-color: ${({ theme }) => theme.tag.background.gray};
  height: 100%;
  width: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.xs};

  ${({ active, theme }) =>
    active &&
    css`
      background-color: ${theme.tag.background.red};
    `}
`;

const StyledLabels = styled.div`
  align-items: center;
  display: flex;
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1 0 auto;
`;

const StyledTime = styled.div`
  align-items: center;
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  gap: ${({ theme }) => theme.spacing(1)};
  width: ${({ theme }) => theme.spacing(26)};
`;

const StyledTitle = styled.div<{ active: boolean; canceled: boolean }>`
  flex: 1 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: ${({ theme }) => theme.spacing(10)};
  ${({ theme, active }) =>
    active &&
    css`
      color: ${theme.font.color.primary};
      font-weight: ${theme.font.weight.medium};
    `}

  ${({ canceled }) =>
    canceled &&
    css`
      text-decoration: line-through;
    `}
`;

export const CalendarEventRow = ({
  calendarEvent,
  className,
}: CalendarEventRowProps) => {
  const theme = useTheme();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { openCalendarEventInCommandMenu } =
    useOpenCalendarEventInCommandMenu();
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
  });

  const startsAt = getCalendarEventStartDate(calendarEvent);
  const endsAt = getCalendarEventEndDate(calendarEvent);
  const hasEnded = hasCalendarEventEnded(calendarEvent);

  const startTimeLabel = calendarEvent.isFullDay
    ? 'All day'
    : format(startsAt, 'HH:mm');
  const endTimeLabel = calendarEvent.isFullDay ? '' : format(endsAt, 'HH:mm');

  const isCurrentWorkspaceMemberAttending = calendarEvent.participants?.some(
    ({ workspaceMemberId }) => workspaceMemberId === currentWorkspaceMember?.id,
  );
  const showTitle =
    calendarEvent.visibility === CalendarChannelVisibility.SHARE_EVERYTHING;

  // 🎯 DIFFERENTIATE LOCAL VS EXTERNAL EVENTS
  const isLocalEvent = (calendarEvent as any)._isLocalEvent === true;

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

      {/* 🎯 ACTIONS ONLY FOR LOCAL EVENTS */}
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
