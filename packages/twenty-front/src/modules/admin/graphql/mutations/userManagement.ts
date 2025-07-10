import { gql } from '@apollo/client';

export const PROMOTE_TO_SUPER_ADMIN = gql`
  mutation PromoteToSuperAdmin($userId: String!) {
    promoteToSuperAdmin(userId: $userId) {
      id
      firstName
      lastName
      email
      canImpersonate
      canAccessFullAdminPanel
      isSuperAdmin
    }
  }
`;

export const REVOKE_ADMIN_ACCESS = gql`
  mutation RevokeAdminAccess($userId: String!) {
    revokeAdminAccess(userId: $userId) {
      id
      firstName
      lastName
      email
      canImpersonate
      canAccessFullAdminPanel
      isSuperAdmin
    }
  }
`;

export const DISABLE_USER = gql`
  mutation DisableUser($userId: String!) {
    disableUser(userId: $userId) {
      id
      firstName
      lastName
      email
      disabled
    }
  }
`;

export const ENABLE_USER = gql`
  mutation EnableUser($userId: String!) {
    enableUser(userId: $userId) {
      id
      firstName
      lastName
      email
      disabled
    }
  }
`;
