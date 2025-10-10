import { IndexData, RawDayData } from '@/types';
import {
  MOCK_AVAILABLE_DATES,
  MOCK_DAY_DATA_BY_DATE,
  MOCK_INDEX_DATA,
} from '@/mocks/mockArchiveData';

/**
 * Loads the index.json file containing all users and groups
 */
export async function loadIndexData(): Promise<IndexData> {
  try {
    const response = await fetch('/index.json');
    if (!response.ok) {
      throw new Error(`Failed to load index data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Using mock index data due to load failure.', error);
    return MOCK_INDEX_DATA;
  }
}

/**
 * Loads conversation data for a specific date
 */
export async function loadDayData(date: string): Promise<RawDayData> {
  try {
    const response = await fetch(`/days/${date}/conversations.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to load data for ${date}: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    const mockData = MOCK_DAY_DATA_BY_DATE[date];
    if (mockData) {
      console.warn(
        `Using mock day data for ${date} due to load failure.`,
        error
      );
      return mockData;
    }

    const fallbackMock = MOCK_DAY_DATA_BY_DATE[MOCK_AVAILABLE_DATES[0]];
    if (fallbackMock) {
      console.warn(
        `No data found for ${date}. Falling back to mock data for ${fallbackMock.date}.`,
        error
      );
      return fallbackMock;
    }

    throw error;
  }
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

  const uniqueDates = new Set(dateStrings);
  MOCK_AVAILABLE_DATES.forEach((dateStr) => uniqueDates.add(dateStr));

  return Array.from(uniqueDates).map((dateStr) => new Date(dateStr));
}
