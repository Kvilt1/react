import { DayData, IndexData } from '@/types';
import { loadDayData } from './dataLoader';
import { transformDayData } from './dataTransformer';

/**
 * Fetches and transforms day data for a specific date
 */
export async function fetchDayData(
  date: string,
  indexData: IndexData
): Promise<DayData> {
  const rawData = await loadDayData(date);
  return transformDayData(rawData, indexData);
}
