import { http, HttpResponse } from 'msw';
import dayData from './data/2025-07-27.json';

export const handlers = [
  http.get('/api/day/:date', ({ params }) => {
    const { date } = params;
    
    // For now, return the same mock data regardless of date
    if (date === '2025-07-27' || !date) {
      return HttpResponse.json(dayData);
    }
    
    return HttpResponse.json(
      { error: 'Day not found' },
      { status: 404 }
    );
  }),
];
