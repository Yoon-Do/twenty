import { useMemo } from 'react';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { TimelineCalendarEvent, CalendarChannelVisibility, TimelineCalendarEventsWithTotal } from '~/generated/graphql';
import { getTimelineCalendarEventsFromPersonId } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromPersonId';
import { getTimelineCalendarEventsFromCompanyId } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromCompanyId';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from '@/activities/calendar/constants/Calendar';

export const useUnifiedCalendarEvents = (targetableObject: ActivityTargetableObject) => {
  // Determine query based on target object type
  const [query, queryName] =
    targetableObject.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? [
          getTimelineCalendarEventsFromPersonId,
          'getTimelineCalendarEventsFromPersonId',
        ]
      : [
          getTimelineCalendarEventsFromCompanyId,
          'getTimelineCalendarEventsFromCompanyId',
        ];

  // Existing external events - KEEP AS IS
  const { 
    data: externalEventsData, 
    firstQueryLoading: externalLoading,
    fetchMoreRecords: fetchMoreExternal,
    isFetchingMore: isFetchingMoreExternal
  } = useCustomResolver<TimelineCalendarEventsWithTotal>(
    query,
    queryName,
    'timelineCalendarEvents',
    targetableObject,
    TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
  );

  // Local events - LEVERAGE EXISTING HOOK
  const { records: localEvents, loading: localLoading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.LocalCalendarEvent,
    filter: targetableObject.targetObjectNameSingular === 'person' 
      ? { personId: { eq: targetableObject.id } }
      : { companyId: { eq: targetableObject.id } },
    orderBy: [{ startsAt: 'DescNullsLast' }], // Same as external events
  });

  // 🎯 TRANSFORM LOCAL EVENTS TO TIMELINE FORMAT
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
      visibility: CalendarChannelVisibility.SHARE_EVERYTHING, // Local events always visible
      conferenceSolution: '',
      conferenceLink: {
        primaryLinkLabel: '',
        primaryLinkUrl: '',
        secondaryLinks: null,
      },
      participants: [], // TODO: Implement participants later
      __typename: 'TimelineCalendarEvent', // 🎯 IMPORTANT: Same as external events
      // Add flag to differentiate (internal use only)
      _isLocalEvent: true,
    }));
  }, [localEvents]);

  // 🎯 MERGE AND SORT LIKE EXISTING LOGIC
  const unifiedEvents = useMemo(() => {
    const external = externalEventsData?.timelineCalendarEvents || [];
    const combined = [...external, ...transformedLocalEvents];
    
    // Sort by startsAt like existing logic
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
    fetchMoreRecords: fetchMoreExternal, // Only external events have pagination
  };
};
