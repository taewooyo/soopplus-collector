/**
 * Filter user type - simplified structure for filtering
 */
export interface FilterUser {
  type: 'nick' | 'id';
  value: string;
}

/**
 * Legacy user structure (for backward compatibility)
 * Used in the old storage format
 */
export interface LegacyUser {
  isNickname: boolean;
  user: string;
}

/**
 * Convert legacy user arrays to the new FilterUser format
 * @param nicks - Array of nickname-based users
 * @param ids - Array of id-based users
 * @returns Combined array of FilterUser
 */
export function migrateLegacyUsers(
  nicks: LegacyUser[],
  ids: LegacyUser[]
): FilterUser[] {
  return [
    ...nicks.map((n) => ({ type: 'nick' as const, value: n.user })),
    ...ids.map((i) => ({ type: 'id' as const, value: i.user })),
  ];
}

/**
 * Convert FilterUser array back to legacy format
 * Useful for backward compatibility with content scripts
 */
export function toLegacyFormat(users: FilterUser[]): {
  nicks: LegacyUser[];
  ids: LegacyUser[];
} {
  return {
    nicks: users
      .filter((u) => u.type === 'nick')
      .map((u) => ({ isNickname: true, user: u.value })),
    ids: users
      .filter((u) => u.type === 'id')
      .map((u) => ({ isNickname: false, user: u.value })),
  };
}
