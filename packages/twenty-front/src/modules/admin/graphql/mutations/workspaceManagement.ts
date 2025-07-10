import { gql } from '@apollo/client';

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($data: CreateWorkspaceInput!) {
    createWorkspace(data: $data) {
      id
      displayName
      subdomain
      logo
      activationStatus
      allowImpersonation
      isPublicInviteLinkEnabled
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_WORKSPACE = gql`
  mutation UpdateWorkspace(
    $workspaceId: String!
    $data: UpdateWorkspaceInput!
  ) {
    updateWorkspace(workspaceId: $workspaceId, data: $data) {
      id
      displayName
      subdomain
      logo
      activationStatus
      allowImpersonation
      isPublicInviteLinkEnabled
      createdAt
      updatedAt
    }
  }
`;

export const ACTIVATE_WORKSPACE = gql`
  mutation ActivateWorkspace($workspaceId: String!) {
    activateWorkspace(workspaceId: $workspaceId) {
      id
      displayName
      subdomain
      activationStatus
    }
  }
`;

export const DEACTIVATE_WORKSPACE = gql`
  mutation DeactivateWorkspace($workspaceId: String!) {
    deactivateWorkspace(workspaceId: $workspaceId) {
      id
      displayName
      subdomain
      activationStatus
    }
  }
`;

export const DELETE_WORKSPACE = gql`
  mutation DeleteWorkspace($workspaceId: String!) {
    deleteWorkspace(workspaceId: $workspaceId) {
      id
      displayName
      subdomain
    }
  }
`;
