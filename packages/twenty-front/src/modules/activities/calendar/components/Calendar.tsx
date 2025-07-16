import styled from '@emotion/styled';
import { format, getYear } from 'date-fns';

import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { LocalCalendarNewEventButton } from '@/activities/calendar/components/LocalCalendarNewEventButton';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { useUnifiedCalendarEvents } from '@/activities/calendar/hooks/useUnifiedCalendarEvents';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { H3Title } from 'twenty-ui/display';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
  Section,
} from 'twenty-ui/layout';
import { TimelineCalendarEventsWithTotal } from '~/generated/graphql';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  overflow: scroll;
`;

const StyledYear = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledTitleContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4, 6, 2, 6)};
`;

export const Calendar = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  // 🎯 USE UNIFIED HOOK - TRANSPARENT FOR USER
  const { data, firstQueryLoading, isFetchingMore, fetchMoreRecords } =
    useUnifiedCalendarEvents(targetableObject);

  // Extract data like existing logic
  const { timelineCalendarEvents, totalNumberOfCalendarEvents } =
    data?.[targetableObject.targetObjectNameSingular === 'person'
      ? 'getTimelineCalendarEventsFromPersonId'
      : 'getTimelineCalendarEventsFromCompanyId'
    ] ?? {};

  const hasMoreCalendarEvents =
    timelineCalendarEvents && totalNumberOfCalendarEvents
      ? timelineCalendarEvents?.length < totalNumberOfCalendarEvents
      : false;

  const handleLastRowVisible = async () => {
    if (hasMoreCalendarEvents) {
      await fetchMoreRecords();
    }
  };

  const {
    calendarEventsByDayTime,
    daysByMonthTime,
    monthTimes,
    monthTimesByYear,
  } = useCalendarEvents(timelineCalendarEvents || []);

  if (firstQueryLoading) {
    return <SkeletonLoader />;
  }

  // 🎯 NATIVE EXPERIENCE: Button to create like Tasks/Notes
  if (!firstQueryLoading && !timelineCalendarEvents?.length) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noMatchRecord" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No Events
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            No events have been scheduled with this{' '}
            {targetableObject.targetObjectNameSingular} yet.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        {/* 🎯 CREATE BUTTON LIKE TASKS/NOTES */}
        <LocalCalendarNewEventButton
          targetableObject={targetableObject}
          variant="secondary"
        />
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <CalendarContext.Provider
      value={{
        calendarEventsByDayTime,
      }}
    >
      <StyledContainer>
        {/* 🎯 HEADER WITH CREATE BUTTON - LIKE TASKS/NOTES */}
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
