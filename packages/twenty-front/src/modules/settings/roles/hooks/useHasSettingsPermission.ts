import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { SettingPermissionType } from '~/generated/graphql';

export const useHasSettingsPermission = (
  settingsPermission?: SettingPermissionType,
) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const currentUser = useRecoilValue(currentUserState);

  if (!settingsPermission) {
    return true;
  }

  // Super admin has all settings permissions
  if (currentUser?.isSuperAdmin) {
    return true;
  }

  if (
    settingsPermission === SettingPermissionType.WORKSPACE &&
    currentWorkspace?.activationStatus ===
      WorkspaceActivationStatus.PENDING_CREATION
  ) {
    return true;
  }

  const currentUserWorkspaceSetting = currentUserWorkspace?.settingsPermissions;

  if (!currentUserWorkspaceSetting) {
    return false;
  }

  return currentUserWorkspaceSetting.includes(settingsPermission);
};
