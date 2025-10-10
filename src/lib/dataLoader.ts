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

    const data = (await response.json()) as IndexData;

    if (!data || !data.users?.length || !data.account_owner) {
      console.warn(
        'Loaded index.json but it did not contain any users. Falling back to mock index data for development.'
      );
      return structuredCloneIndexData(MOCK_INDEX_DATA);
    }

    return data;
  } catch (error) {
    console.warn('Using mock index data due to load failure.', error);
    return structuredCloneIndexData(MOCK_INDEX_DATA);
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

    const data = (await response.json()) as RawDayData | null;

    if (!hasConversationPayload(data)) {
      const mockData = resolveMockDayData(date);
      if (mockData) {
        console.warn(
          `Loaded conversations.json for ${date} but it did not contain any conversations. Falling back to mock data for ${mockData.date}.`
        );
        return mockData;
      }

      throw new Error(`Day data for ${date} is empty.`);
    }

    return data;
  } catch (error) {
    const mockData = resolveMockDayData(date);
    if (mockData) {
      console.warn(
        `Using mock day data for ${mockData.date} due to load failure for ${date}.`,
        error
      );
      return mockData;
    }

    throw error;
  }
}

function hasConversationPayload(data: RawDayData | null): data is RawDayData {
  return !!(
    data &&
    Array.isArray(data.conversations) &&
    data.conversations.length > 0 &&
    typeof data.date === 'string'
  );
}

function resolveMockDayData(date: string): RawDayData | null {
  const mockByExactDate = MOCK_DAY_DATA_BY_DATE[date];
  if (mockByExactDate) {
    return structuredCloneDayData(mockByExactDate);
  }

  const fallbackDate = MOCK_AVAILABLE_DATES[0];
  if (!fallbackDate) {
    return null;
  }

  const fallbackMock = MOCK_DAY_DATA_BY_DATE[fallbackDate];
  return fallbackMock ? structuredCloneDayData(fallbackMock) : null;
}

function structuredCloneDayData(data: RawDayData): RawDayData {
  return JSON.parse(JSON.stringify(data));
}

function structuredCloneIndexData(data: IndexData): IndexData {
  return JSON.parse(JSON.stringify(data));
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
