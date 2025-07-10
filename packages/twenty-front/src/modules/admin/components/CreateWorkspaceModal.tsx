import { CREATE_WORKSPACE } from '@/admin/graphql/mutations/workspaceManagement';
import { GET_WORKSPACES } from '@/admin/graphql/queries/getWorkspaces';
import { useMutation } from '@apollo/client';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { H2Title } from 'twenty-ui/display';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(6)};
  width: 400px;
`;

const StyledFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledErrorText = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledActions = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${({ theme, variant }) =>
    variant === 'primary' ? theme.color.blue : theme.background.secondary};
  border: 1px solid
    ${({ theme, variant }) =>
      variant === 'primary' ? theme.color.blue : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, variant }) =>
    variant === 'primary' ? 'white' : theme.font.color.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, variant }) =>
      variant === 'primary'
        ? theme.color.blue80
        : theme.background.transparent.light};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const createWorkspaceSchema = z.object({
  displayName: z.string().min(1, 'Workspace name is required'),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain must be at most 30 characters')
    .regex(
      /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/,
      'Subdomain must contain only lowercase letters, numbers, and hyphens',
    ),
});

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

const MODAL_ID = 'create-workspace-modal';

interface CreateWorkspaceModalProps {
  onClose?: () => void;
}

export const CreateWorkspaceModal = ({
  onClose,
}: CreateWorkspaceModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { closeModal } = useModal();

  const [createWorkspace] = useMutation(CREATE_WORKSPACE, {
    refetchQueries: [{ query: GET_WORKSPACES }],
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await createWorkspace({
        variables: {
          data: {
            displayName: data.displayName,
            subdomain: data.subdomain,
          },
        },
      });

      reset();
      closeModal(MODAL_ID);
      onClose?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    closeModal(MODAL_ID);
    onClose?.();
  };

  return (
    <Modal modalId={MODAL_ID} isClosable={true} onClose={handleClose} size="medium" padding="large">
      <StyledContent>
        <H2Title
          title="Create Workspace"
          description="Create a new workspace for your organization"
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <StyledFormField>
            <StyledLabel>Workspace Name</StyledLabel>
            <Controller
              name="displayName"
              control={control}
              render={({ field }) => (
                <TextInputV2
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Enter workspace name"
                  error={errors.displayName?.message}
                  fullWidth
                />
              )}
            />
            {errors.displayName && (
              <StyledErrorText>{errors.displayName.message}</StyledErrorText>
            )}
          </StyledFormField>

          <StyledFormField>
            <StyledLabel>Subdomain</StyledLabel>
            <Controller
              name="subdomain"
              control={control}
              render={({ field }) => (
                <TextInputV2
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Enter subdomain"
                  error={errors.subdomain?.message}
                  rightAdornment=".twenty.com"
                  fullWidth
                />
              )}
            />
            {errors.subdomain && (
              <StyledErrorText>{errors.subdomain.message}</StyledErrorText>
            )}
          </StyledFormField>

          {error && <StyledErrorText>{error}</StyledErrorText>}

          <StyledActions>
            <StyledButton
              type="button"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </StyledButton>
            <StyledButton type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Workspace'}
            </StyledButton>
          </StyledActions>
        </form>
      </StyledContent>
    </Modal>
  );
};
