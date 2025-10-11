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

const DATE_MANIFEST_CANDIDATES = [
  '/days/available-dates.json',
  '/available-dates.json',
  '/days/dates.json',
  '/days/index.json',
  '/dates.json',
];

let availableDateCache: string[] | null = null;
let availableDatePromise: Promise<string[]> | null = null;

export async function loadAvailableDateStrings(
  indexData?: IndexData | null
): Promise<string[]> {
  if (availableDateCache) {
    return availableDateCache;
  }

  if (!availableDatePromise) {
    availableDatePromise = computeAvailableDates(indexData)
      .then((dates) => {
        availableDateCache = dates;
        return dates;
      })
      .catch((error) => {
        console.warn('Falling back to mock available dates due to error.', error);
        const fallback = normalizeAndSortDates([...MOCK_AVAILABLE_DATES]);
        availableDateCache = fallback;
        return fallback;
      })
      .finally(() => {
        availableDatePromise = null;
      });
  }

  return availableDatePromise;
}

async function computeAvailableDates(
  indexData?: IndexData | null
): Promise<string[]> {
  const collected: string[] = [];

  if (indexData?.available_dates?.length) {
    collected.push(...indexData.available_dates);
  }

  for (const manifestPath of DATE_MANIFEST_CANDIDATES) {
    const manifestDates = await requestAvailableDatesFromManifest(manifestPath);
    if (manifestDates) {
      collected.push(...manifestDates);
    }
  }

  if (collected.length === 0) {
    const directoryDates = await requestAvailableDatesFromDirectoryListing();
    if (directoryDates) {
      collected.push(...directoryDates);
    }
  }

  if (collected.length === 0) {
    collected.push(...MOCK_AVAILABLE_DATES);
  }

  const normalized = normalizeAndSortDates(collected);
  if (normalized.length > 0) {
    return normalized;
  }

  return normalizeAndSortDates([...MOCK_AVAILABLE_DATES]);
}

async function requestAvailableDatesFromManifest(
  manifestPath: string
): Promise<string[] | null> {
  try {
    const response = await fetch(manifestPath, { cache: 'no-store' });
    if (!response.ok) {
      if (response.status !== 404) {
        console.warn(
          `Failed to load available dates manifest from ${manifestPath}: ${response.status}`
        );
      }
      return null;
    }

    const payload = await response.json();
    const dates = extractDateStrings(payload);
    return dates.length > 0 ? dates : null;
  } catch (error) {
    console.warn(
      `Encountered an error while loading available dates from ${manifestPath}.`,
      error
    );
    return null;
  }
}

async function requestAvailableDatesFromDirectoryListing(): Promise<string[] | null> {
  try {
    const response = await fetch('/days/', {
      headers: { Accept: 'text/html,application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      return null;
    }

    const markup = await response.text();
    const dateMatches = Array.from(markup.matchAll(/href="([^"]+)"/g));
    const dates: string[] = [];

    for (const match of dateMatches) {
      const href = match[1];
      const dateMatch = href.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        dates.push(dateMatch[1]);
      }
    }

    return dates.length > 0 ? dates : null;
  } catch (error) {
    console.warn('Failed to derive available dates from directory listing.', error);
    return null;
  }
}

function extractDateStrings(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload.filter((value): value is string => typeof value === 'string');
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidateKeys = ['dates', 'available_dates', 'availableDates'];

    for (const key of candidateKeys) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === 'string');
      }
    }

    const directKeys = Object.keys(record).filter((key) =>
      /(\d{4}-\d{2}-\d{2})/.test(key)
    );
    if (directKeys.length > 0) {
      return directKeys;
    }
  }

  return [];
}

function normalizeAndSortDates(dateStrings: string[]): string[] {
  const unique = new Set<string>();

  dateStrings.forEach((rawValue) => {
    if (typeof rawValue !== 'string') return;
    const trimmed = rawValue.trim();
    if (!trimmed) return;

    const directParse = new Date(trimmed);
    if (!Number.isNaN(directParse.getTime())) {
      unique.add(directParse.toISOString().split('T')[0]);
      return;
    }

    const isoCandidate = trimmed.includes('T')
      ? trimmed
      : `${trimmed}T00:00:00`;
    const parsed = new Date(isoCandidate);
    if (!Number.isNaN(parsed.getTime())) {
      unique.add(parsed.toISOString().split('T')[0]);
    }
  });

  return Array.from(unique).sort((a, b) => a.localeCompare(b));
}
