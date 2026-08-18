export const ROLE_USER = '1095';
export const ROLE_ADMIN = '1096';

const ROLE_LABEL_KEYS: Record<string, string> = {
  [ROLE_ADMIN]: 'AUTH.ROLE_ADMIN',
  [ROLE_USER]: 'AUTH.ROLE_USER',
};

export function roleLabelKey(roleId: string | null | undefined): string {
  if (!roleId) return '';
  return ROLE_LABEL_KEYS[roleId] ?? '';
}
