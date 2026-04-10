import { apiClient } from './apiClient';

export const fetchSchedule = (start: string, end: string) => 
    apiClient(false, `/schedule?sportId=1&startDate=${start}&endDate=${end}&hydrate=game(tickets),broadcasts`);

export const fetchGame = (gamePk: string) => 
    apiClient(true, `/game/${gamePk}/feed/live`);

export const fetchContent = (gamePk: string) =>
    apiClient(false, `/game/${gamePk}/content`);
