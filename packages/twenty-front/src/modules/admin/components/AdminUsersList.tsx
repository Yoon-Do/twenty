import {
    DISABLE_USER,
    ENABLE_USER,
} from '@/admin/graphql/mutations/userManagement';
import { GET_USERS } from '@/admin/graphql/queries/getUsers';
import { currentUserState } from '@/auth/states/currentUserState';
import { useMutation, useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
    Avatar,
    H2Title,
    IconCalendar,
    IconMail,
    IconUserCircle,
    IconUsers
} from 'twenty-ui/display';
import { Card, CardContent, Section } from 'twenty-ui/layout';
import { User } from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

const StyledUserGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledUserCard = styled(Card)<{ isCurrentUser?: boolean }>`
  ${({ isCurrentUser, theme }) =>
    isCurrentUser &&
    `
    border: 1px solid ${theme.border.color.strong};
    background: ${theme.background.transparent.light};
  `}
`;

const StyledCurrentUserIndicator = styled.div`
  color: ${({ theme }) => theme.color.blue};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledUserHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledUserInfo = styled.div`
  flex: 1;
`;

const StyledUserName = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledUserEmail = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledUserDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDetailValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
  padding-top: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledStatusBadge = styled.span<{
  variant: 'success' | 'error' | 'warning' | 'info';
}>`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;

  ${({ variant, theme }) => {
    switch (variant) {
      case 'success':
        return `
          background: ${theme.tag.background.green};
          color: ${theme.tag.text.green};
        `;
      case 'error':
        return `
          background: ${theme.tag.background.red};
          color: ${theme.tag.text.red};
        `;
      case 'warning':
        return `
          background: ${theme.tag.background.orange};
          color: ${theme.tag.text.orange};
        `;
      case 'info':
        return `
          background: ${theme.tag.background.blue};
          color: ${theme.tag.text.blue};
        `;
      default:
        return `
          background: ${theme.tag.background.gray};
          color: ${theme.tag.text.gray};
        `;
    }
  }}
`;

const StyledActionButton = styled.button`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    border-color: ${({ theme }) => theme.border.color.strong};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledLoadingText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledErrorText = styled.div`
  color: ${({ theme }) => theme.color.red};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledBadgeContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
  align-items: center;
`;

export const AdminUsersList = () => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const currentUser = useRecoilValue(currentUserState);

  const { data, loading, error, refetch } = useQuery<{ users: User[] }>(
    GET_USERS,
  );

  const [disableUser] = useMutation(DISABLE_USER);
  const [enableUser] = useMutation(ENABLE_USER);

  const handleDisableUser = async (userId: string) => {
    try {
      setLoadingAction(userId);
      await disableUser({ variables: { userId } });
      await refetch();
    } catch (error) {
      // Handle error silently
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEnableUser = async (userId: string) => {
    try {
      setLoadingAction(userId);
      await enableUser({ variables: { userId } });
      await refetch();
    } catch (error) {
      // Handle error silently
    } finally {
      setLoadingAction(null);
    }
  };

  if (loading) {
    return (
      <Section>
        <H2Title title="Users" description="Manage all users in the system" />
        <StyledLoadingText>Loading users...</StyledLoadingText>
      </Section>
    );
  }

  if (error != null) {
    return (
      <Section>
        <H2Title title="Users" description="Manage all users in the system" />
        <StyledErrorText>Error loading users: {error.message}</StyledErrorText>
      </Section>
    );
  }

  const users = data?.users ?? [];

  // Sort users to put current user first
  const sortedUsers = [...users].sort((a, b) => {
    if (currentUser !== null && a.id === currentUser.id) return -1;
    if (currentUser !== null && b.id === currentUser.id) return 1;
    return 0;
  });

  const getUserRole = (user: User) => {
    if (user.isSuperAdmin) return 'Super Admin';
    if (user.canAccessFullAdminPanel) return 'Admin';
    if (user.canImpersonate) return 'Impersonator';
    return 'User';
  };

  const getRoleVariant = (
    user: User,
  ): 'success' | 'error' | 'warning' | 'info' => {
    if (user.isSuperAdmin) return 'error';
    if (user.canAccessFullAdminPanel) return 'warning';
    if (user.canImpersonate) return 'info';
    return 'success';
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Section>
      <H2Title
        title="Users"
        description={`${users.length} user${users.length !== 1 ? 's' : ''} in the system`}
      />

      {users.length === 0 ? (
        <StyledEmptyState>No users found</StyledEmptyState>
      ) : (
        <StyledUserGrid>
          {sortedUsers.map((user) => {
            const isCurrentUser = currentUser?.id === user.id;

            return (
              <StyledUserCard key={user.id} isCurrentUser={isCurrentUser}>
                <CardContent>
                  {isCurrentUser && (
                    <StyledCurrentUserIndicator>
                      <IconUserCircle size={16} />
                      This is you
                    </StyledCurrentUserIndicator>
                  )}

                  <StyledUserHeader>
                    <Avatar
                      avatarUrl={user.defaultAvatarUrl || undefined}
                      placeholder={getInitials(user.firstName, user.lastName)}
                      size="lg"
                      type="squared"
                    />
                    <StyledUserInfo>
                      <StyledUserName>
                        {user.firstName} {user.lastName}
                      </StyledUserName>
                      <StyledUserEmail>
                        <IconMail size={14} />
                        {user.email}
                      </StyledUserEmail>
                    </StyledUserInfo>
                    <StyledBadgeContainer>
                      <StyledStatusBadge variant={getRoleVariant(user)}>
                        {getUserRole(user)}
                      </StyledStatusBadge>
                      <StyledStatusBadge
                        variant={user.disabled ? 'error' : 'success'}
                      >
                        {user.disabled ? 'Disabled' : 'Active'}
                      </StyledStatusBadge>
                    </StyledBadgeContainer>
                  </StyledUserHeader>

                  <StyledUserDetails>
                    <StyledDetailItem>
                      <IconUsers size={16} />
                      <StyledDetailValue>
                        {user.workspaces?.length || 0} workspace
                        {user.workspaces?.length !== 1 ? 's' : ''}
                      </StyledDetailValue>
                    </StyledDetailItem>
                    <StyledDetailItem>
                      <IconCalendar size={16} />
                      <StyledDetailValue>
                        {formatToHumanReadableDate(user.createdAt)}
                      </StyledDetailValue>
                    </StyledDetailItem>
                    {!user.isEmailVerified && (
                      <StyledDetailItem>
                        <StyledStatusBadge variant="warning">
                          Email Unverified
                        </StyledStatusBadge>
                      </StyledDetailItem>
                    )}
                  </StyledUserDetails>

                  <StyledActions>
                    {user.disabled ? (
                      <StyledActionButton
                        onClick={() => handleEnableUser(user.id)}
                        disabled={loadingAction === user.id}
                      >
                        Enable User
                      </StyledActionButton>
                    ) : (
                      <StyledActionButton
                        onClick={() => handleDisableUser(user.id)}
                        disabled={loadingAction === user.id}
                      >
                        Disable User
                      </StyledActionButton>
                    )}
                  </StyledActions>
                </CardContent>
              </StyledUserCard>
            );
          })}
        </StyledUserGrid>
      )}
    </Section>
  );
};
