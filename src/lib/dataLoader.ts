import { IndexData, RawDayData } from '@/types';

// Cache for available dates to avoid multiple fetches
let cachedDates: Date[] | null = null;

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
 * Fetches available dates from the API endpoint
 */
export async function fetchAvailableDates(): Promise<string[]> {
  try {
    const response = await fetch('/api/available-dates');
    if (!response.ok) {
      throw new Error('Failed to fetch available dates');
    }
    const data = await response.json();
    return data.dates || [];
  } catch (error) {
    console.error('Error fetching available dates:', error);
    // Return empty array if fetch fails
    return [];
  }
}

/**
 * Gets list of available dates by dynamically fetching from the server
 * Results are cached for the session
 */
export async function getAvailableDates(): Promise<Date[]> {
  // Return cached dates if available
  if (cachedDates !== null) {
    return cachedDates;
  }

  // Fetch dates from the server
  const dateStrings = await fetchAvailableDates();

  // Convert to Date objects and cache
  cachedDates = dateStrings.map((dateStr) => new Date(dateStr));

  return cachedDates;
}

/**
 * Clears the cached dates (useful if dates might have changed)
 */
export function clearDateCache(): void {
  cachedDates = null;
}
