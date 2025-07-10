import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      firstName
      lastName
      email
      isEmailVerified
      disabled
      canImpersonate
      canAccessFullAdminPanel
      isSuperAdmin
      locale
      createdAt
      updatedAt
      workspaces {
        id
        workspace {
          id
          displayName
          subdomain
        }
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($searchTerm: String!) {
    searchUsers(searchTerm: $searchTerm) {
      id
      firstName
      lastName
      email
      isEmailVerified
      disabled
      canImpersonate
      canAccessFullAdminPanel
      isSuperAdmin
      locale
      createdAt
      updatedAt
      workspaces {
        id
        workspace {
          id
          displayName
          subdomain
        }
      }
    }
  }
`;

export const GET_USER = gql`
  query GetUser($userId: String!) {
    user(userId: $userId) {
      id
      firstName
      lastName
      email
      isEmailVerified
      disabled
      canImpersonate
      canAccessFullAdminPanel
      isSuperAdmin
      locale
      createdAt
      updatedAt
      workspaces {
        id
        workspace {
          id
          displayName
          subdomain
        }
      }
    }
  }
`;
