import { IndexData, RawDayData } from '@/types';

/**
 * Loads the index.json file containing all users and groups
 */
export async function loadIndexData(): Promise<IndexData> {
  const response = await fetch('/index.json');
  if (!response.ok) {
    throw new Error('Failed to load index data');
  }
  return response.json();
}

/**
 * Loads conversation data for a specific date
 */
export async function loadDayData(date: string): Promise<RawDayData> {
  const response = await fetch(`/days/${date}/conversations.json`);
  if (!response.ok) {
    throw new Error(`Failed to load data for ${date}`);
  }
  return response.json();
}

/**
 * Gets list of available dates by scanning the days directory
 * For now, this is hardcoded but could be made dynamic
 */
export function getAvailableDates(): Date[] {
  // These are the dates we have in the public/days folder
  const dateStrings = [
    '2025-08-24',
    '2025-08-25',
    '2025-08-26',
    '2025-08-27',
    '2025-08-28',
    '2025-08-29',
    '2025-08-30',
    '2025-08-31',
    '2025-09-01',
    '2025-09-02',
    '2025-09-03',
    '2025-09-04',
    '2025-09-05',
  ];

  return dateStrings.map((dateStr) => new Date(dateStr));
}
