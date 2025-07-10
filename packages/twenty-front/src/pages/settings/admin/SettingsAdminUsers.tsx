import { AdminUsersList } from '@/admin/components/AdminUsersList';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsAdminUsers = () => {
  return (
    <SubMenuTopBarContainer
      title="Users"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Admin Panel',
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        { children: 'Users' },
      ]}
    >
      <SettingsPageContainer>
        <AdminUsersList />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
