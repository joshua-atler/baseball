import { apiClient } from './apiClient';

export const fetchSchedule = (start: string, end: string) => 
    apiClient(`/schedule?sportId=1&startDate=${start}&endDate=${end}`);
