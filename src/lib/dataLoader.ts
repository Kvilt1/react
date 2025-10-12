import { IndexData, RawDayData } from '@/types';
import {
  mockAvailableDates,
  mockDayDataByDate,
  mockIndexData,
} from '@/mock/mockData';

/**
 * Loads the index.json file containing all users and groups
 */
export async function loadIndexData(): Promise<IndexData> {
  try {
    const response = await fetch('/index.json');
    if (response.ok) {
      return response.json();
    }

    console.warn(
      `Received ${response.status} when loading index.json, falling back to mock data.`
    );
  } catch (error) {
    console.warn('Falling back to mock index data:', error);
  }

  console.warn('Using mock index data because no public data was found.');
  return JSON.parse(JSON.stringify(mockIndexData));
}

/**
 * Loads conversation data for a specific date
 */
export async function loadDayData(
  date: string,
  signal?: AbortSignal
): Promise<RawDayData> {
  try {
    const response = await fetch(`/days/${date}/conversations.json`, {
      signal,
    });

    if (response.ok) {
      return response.json();
    }

    console.warn(`Received ${response.status} while loading ${date}, falling back to mock data.`);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    console.warn(`Falling back to mock day data for ${date}:`, error);
  }

  const mockData = mockDayDataByDate[date];
  if (mockData) {
    console.warn(`Using mock day data for ${date} because no public data was found.`);
    return JSON.parse(JSON.stringify(mockData));
  }

  throw new Error(`Failed to load data for ${date}`);
}

/**
 * Loads the list of available dates.
 * Attempts to use the index payload, an optional manifest, and
 * finally falls back to mock data so the UI stays functional.
 */
export async function loadAvailableDates(
  indexData?: IndexData | null
): Promise<string[]> {
  if (indexData?.available_dates?.length) {
    return indexData.available_dates.filter((date): date is string =>
      typeof date === 'string'
    );
  }

  try {
    const response = await fetch('/available-dates.json');
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload)) {
        return payload.filter((value): value is string => typeof value === 'string');
      }
      if (Array.isArray(payload?.dates)) {
        return (payload.dates as unknown[]).filter(
          (value): value is string => typeof value === 'string'
        );
      }
    }
  } catch (error) {
    console.warn('Failed to load available dates manifest:', error);
  }

  console.warn('Using mock available dates because no manifest was found.');
  return [...mockAvailableDates];
}
