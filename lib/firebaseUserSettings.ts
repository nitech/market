import type { DocumentData } from 'firebase/firestore';
import { dedupeFranchiseArray } from '@/lib/franchiseList';

export const USER_SETTINGS_COLLECTION = 'userSettings';

export function franchisesFromUserSettingsData(data: DocumentData | undefined): string[] {
  const raw = data?.franchises;
  if (!Array.isArray(raw)) return [];
  const strings = raw.filter((x): x is string => typeof x === 'string');
  return dedupeFranchiseArray(strings);
}
