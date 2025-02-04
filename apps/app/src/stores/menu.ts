import type { MenuGroup } from '@lib/components/Menu.js';
import { router } from './router.js';
import { Toast } from '@lib/components/Toast.js';
import { auth } from './auth.js';
import { ConfirmModal } from '@lib/components/ConfirmModal.js';
import { t } from './i18n.js';
import { config } from './config.js';

export function createMenu(): MenuGroup[] {
  const groups: MenuGroup[] = [
    {
      items: [
        {
          active: () => router.ctx.path === '/',
          url: router.link('/'),
          label: t('Home'),
        },
      ],
    },
  ];

  if (config.dev) {
    groups.push({
      items: [
        {
          active: () => router.ctx.path.startsWith('/test'),
          label: 'Test',
          url: router.link('/test'),
        },
      ],
    });
  }

  groups.push({
    items: [
      {
        active: () => router.ctx.path.startsWith('/chgpwd'),
        label: t('Change Password'),
        url: router.link(`/chgpwd?username=${auth.claims()?.username ?? ''}`),
      },
      {
        variant: 'danger',
        label: t('Logout'),
        icon: 'door-closed',
        onClick: async (evt) => {
          evt.preventDefault();

          const result = await ConfirmModal.show();
          if (!result) {
            return;
          }

          try {
            await auth.logout();
          } finally {
            router.push('/login');
            Toast.open(t('Good bye'));
          }
        },
      },
    ],
  });

  return groups;
}
