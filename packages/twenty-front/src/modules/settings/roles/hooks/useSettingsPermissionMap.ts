import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useRecoilValue } from 'recoil';
import { SettingPermissionType } from '~/generated/graphql';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

export const useSettingsPermissionMap = (): Record<
  SettingPermissionType,
  boolean
> => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const currentUser = useRecoilValue(currentUserState);

  const initialPermissions = buildRecordFromKeysWithSameValue(
    Object.values(SettingPermissionType),
    false,
  );

  // Super admin has all settings permissions
  if (currentUser?.isSuperAdmin) {
    return buildRecordFromKeysWithSameValue(
      Object.values(SettingPermissionType),
      true,
    );
  }

  const currentUserWorkspaceSettingsPermissions =
    currentUserWorkspace?.settingsPermissions;

  if (!currentUserWorkspaceSettingsPermissions) {
    return initialPermissions;
  }

  return currentUserWorkspaceSettingsPermissions.reduce((acc, permission) => {
    acc[permission] = true;
    return acc;
  }, initialPermissions);
};
