import { GET_WORKSPACES } from '@/admin/graphql/queries/getWorkspaces';
import { CreateWorkspaceModal } from '@/admin/components/CreateWorkspaceModal';
import {
  ACTIVATE_WORKSPACE,
  DEACTIVATE_WORKSPACE,
  DELETE_WORKSPACE,
} from '@/admin/graphql/mutations/workspaceManagement';
import { useMutation, useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import {
  Avatar,
  H2Title,
  IconCalendar,
  IconWorld,
  IconPlus,
  IconSettings,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { Workspace, WorkspaceActivationStatus } from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

const StyledWorkspaceGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledWorkspaceCard = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
    box-shadow: ${({ theme }) => theme.boxShadow.light};
  }
`;

const StyledWorkspaceHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledWorkspaceInfo = styled.div`
  flex: 1;
`;

const StyledWorkspaceName = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledWorkspaceSubdomain = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledWorkspaceDetails = styled.div`
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

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const AdminWorkspacesList = () => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { openModal } = useModal();

  const { data, loading, error, refetch } = useQuery<{
    workspaces: Workspace[];
  }>(GET_WORKSPACES);

  const [activateWorkspace] = useMutation(ACTIVATE_WORKSPACE);
  const [deactivateWorkspace] = useMutation(DEACTIVATE_WORKSPACE);
  const [deleteWorkspace] = useMutation(DELETE_WORKSPACE);

  const handleActivateWorkspace = async (workspaceId: string) => {
    try {
      setLoadingAction(workspaceId);
      await activateWorkspace({ variables: { workspaceId } });
      await refetch();
    } catch (error) {
      // Handle error silently for now
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeactivateWorkspace = async (workspaceId: string) => {
    try {
      setLoadingAction(workspaceId);
      await deactivateWorkspace({ variables: { workspaceId } });
      await refetch();
    } catch (error) {
      // Handle error silently for now
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this workspace? This action cannot be undone.',
      )
    ) {
      try {
        setLoadingAction(workspaceId);
        await deleteWorkspace({ variables: { workspaceId } });
        await refetch();
      } catch (error) {
        // Handle error silently for now
      } finally {
        setLoadingAction(null);
      }
    }
  };

  if (loading) {
    return (
      <Section>
        <H2Title
          title="Workspaces"
          description="Manage all workspaces in the system"
        />
        <StyledLoadingText>Loading workspaces...</StyledLoadingText>
      </Section>
    );
  }

  if (error != null) {
    return (
      <Section>
        <H2Title
          title="Workspaces"
          description="Manage all workspaces in the system"
        />
        <StyledErrorText>
          Error loading workspaces: {error.message}
        </StyledErrorText>
      </Section>
    );
  }

  const workspaces = data?.workspaces ?? [];

  const getStatusVariant = (
    status: WorkspaceActivationStatus,
  ): 'success' | 'error' | 'warning' | 'info' => {
    switch (status) {
      case WorkspaceActivationStatus.ACTIVE:
        return 'success';
      case WorkspaceActivationStatus.INACTIVE:
        return 'error';
      case WorkspaceActivationStatus.PENDING_CREATION:
        return 'warning';
      default:
        return 'info';
    }
  };

  const getWorkspaceInitials = (displayName: string) => {
    if (!displayName) return 'WS';
    const words = displayName.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <Section>
      <StyledHeader>
        <H2Title
          title="Workspaces"
          description={`${workspaces.length} workspace${workspaces.length !== 1 ? 's' : ''} in the system`}
        />
        <Button
          title="Create Workspace"
          Icon={IconPlus}
          variant="primary"
          accent="blue"
          onClick={() => openModal('create-workspace-modal')}
        />
      </StyledHeader>

      {workspaces.length === 0 ? (
        <StyledEmptyState>No workspaces found</StyledEmptyState>
      ) : (
        <StyledWorkspaceGrid>
          {workspaces.map((workspace) => (
            <StyledWorkspaceCard key={workspace.id}>
              <StyledWorkspaceHeader>
                <Avatar
                  avatarUrl={workspace.logo || undefined}
                  placeholder={getWorkspaceInitials(
                    workspace.displayName || 'Workspace',
                  )}
                  size="lg"
                  type="squared"
                />
                <StyledWorkspaceInfo>
                  <StyledWorkspaceName>
                    {workspace.displayName || 'Unnamed Workspace'}
                  </StyledWorkspaceName>
                  <StyledWorkspaceSubdomain>
                    <IconWorld size={14} />
                    {workspace.subdomain}.twenty.com
                  </StyledWorkspaceSubdomain>
                </StyledWorkspaceInfo>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <StyledStatusBadge
                    variant={getStatusVariant(workspace.activationStatus)}
                  >
                    {workspace.activationStatus.replace('_', ' ')}
                  </StyledStatusBadge>
                </div>
              </StyledWorkspaceHeader>

              <StyledWorkspaceDetails>
                <StyledDetailItem>
                  <IconCalendar size={16} />
                  <StyledDetailValue>
                    {formatToHumanReadableDate(workspace.createdAt)}
                  </StyledDetailValue>
                </StyledDetailItem>
                <StyledDetailItem>
                  <IconSettings size={16} />
                  <StyledDetailValue>
                    {workspace.allowImpersonation
                      ? 'Impersonation'
                      : 'Protected'}
                  </StyledDetailValue>
                </StyledDetailItem>
              </StyledWorkspaceDetails>

              <StyledActions>
                {workspace.activationStatus ===
                WorkspaceActivationStatus.ACTIVE ? (
                  <StyledActionButton
                    onClick={() => handleDeactivateWorkspace(workspace.id)}
                    disabled={loadingAction === workspace.id}
                  >
                    {loadingAction === workspace.id
                      ? 'Deactivating...'
                      : 'Deactivate'}
                  </StyledActionButton>
                ) : (
                  <StyledActionButton
                    onClick={() => handleActivateWorkspace(workspace.id)}
                    disabled={loadingAction === workspace.id}
                  >
                    {loadingAction === workspace.id
                      ? 'Activating...'
                      : 'Activate'}
                  </StyledActionButton>
                )}
                <StyledActionButton disabled={loadingAction === workspace.id}>
                  Edit
                </StyledActionButton>
                <StyledActionButton
                  onClick={() => handleDeleteWorkspace(workspace.id)}
                  disabled={loadingAction === workspace.id}
                >
                  {loadingAction === workspace.id ? 'Deleting...' : 'Delete'}
                </StyledActionButton>
              </StyledActions>
            </StyledWorkspaceCard>
          ))}
        </StyledWorkspaceGrid>
      )}

      <CreateWorkspaceModal />
    </Section>
  );
};
