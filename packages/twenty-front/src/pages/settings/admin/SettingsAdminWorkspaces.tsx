import { AdminWorkspacesList } from '@/admin/components/AdminWorkspacesList';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsAdminWorkspaces = () => {
  return (
    <SubMenuTopBarContainer
      title="Workspaces"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Admin Panel',
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        { children: 'Workspaces' },
      ]}
    >
      <SettingsPageContainer>
        <AdminWorkspacesList />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
