import { FilterTypes } from './setting';

/**
 * Grade types supported by the filter
 */
export type UserGrade = 'bj' | 'manager' | 'topfan' | 'gudok' | 'fan' | 'user';

/**
 * Maps grade string to filter type key
 */
export const gradeToFilterKey: Record<UserGrade, keyof FilterTypes> = {
  bj: 'streamer',
  manager: 'manager',
  topfan: 'topfan',
  gudok: 'gudok',
  fan: 'fan',
  user: 'user',
};

/**
 * Filter toggle key type
 */
export type FilterToggleKey = keyof FilterTypes;
