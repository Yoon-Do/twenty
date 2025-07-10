import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated-metadata/graphql';

type useObjectPermissionsReturnType = {
  objectPermissionsByObjectMetadataId: Record<string, ObjectPermission>;
};

export const useObjectPermissions = (): useObjectPermissionsReturnType => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const currentUser = useRecoilValue(currentUserState);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  // Super admin has full permissions for all objects
  if (currentUser?.isSuperAdmin) {
    const fullPermissions = objectMetadataItems.reduce(
      (acc: Record<string, ObjectPermission>, objectMetadataItem) => {
        acc[objectMetadataItem.id] = {
          objectMetadataId: objectMetadataItem.id,
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: true,
          canDestroyObjectRecords: true,
        };
        return acc;
      },
      {},
    );

    return {
      objectPermissionsByObjectMetadataId: fullPermissions,
    };
  }

  const objectPermissions = currentUserWorkspace?.objectPermissions;

  if (!isDefined(objectPermissions)) {
    return {
      objectPermissionsByObjectMetadataId: {},
    };
  }

  const objectPermissionsByObjectMetadataId = objectPermissions?.reduce(
    (acc: Record<string, ObjectPermission>, objectPermission) => {
      acc[objectPermission.objectMetadataId] = objectPermission;
      return acc;
    },
    {},
  );

  return {
    objectPermissionsByObjectMetadataId,
  };
};
