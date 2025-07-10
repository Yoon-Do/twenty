import { CREATE_WORKSPACE } from '@/admin/graphql/mutations/workspaceManagement';
import { GET_WORKSPACES } from '@/admin/graphql/queries/getWorkspaces';
import { useMutation } from '@apollo/client';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { H2Title } from 'twenty-ui/display';
import { Button, MainButton } from 'twenty-ui/input';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledErrorText = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(2)};
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
    <Modal
      modalId={MODAL_ID}
      isClosable={true}
      onClose={handleClose}
      size="medium"
    >
      <Modal.Header>
        <H2Title
          title="Create Workspace"
          description="Create a new workspace for your organization"
        />
      </Modal.Header>

      <Modal.Content>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="displayName"
            control={control}
            render={({ field }) => (
              <TextInputV2
                label="Workspace Name"
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Enter workspace name"
                error={errors.displayName?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="subdomain"
            control={control}
            render={({ field }) => (
              <TextInputV2
                label="Subdomain"
                value={field.value || ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Enter subdomain"
                error={errors.subdomain?.message}
                rightAdornment=".twenty.com"
                fullWidth
              />
            )}
          />

          {error && <StyledErrorText>{error}</StyledErrorText>}
        </StyledForm>
      </Modal.Content>

      <Modal.Footer>
        <Button
          variant="secondary"
          title="Cancel"
          onClick={handleClose}
          disabled={isLoading}
        />
        <MainButton
          title={isLoading ? 'Creating...' : 'Create Workspace'}
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
        />
      </Modal.Footer>
    </Modal>
  );
};
