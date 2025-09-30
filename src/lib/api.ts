import { DayData } from '@/types';

const API_BASE = '/api';

export async function fetchDayData(date: string): Promise<DayData> {
  const response = await fetch(`${API_BASE}/day/${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch day data');
  }
  return response.json();
}
