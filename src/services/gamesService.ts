import { apiClient } from './apiClient';

export const fetchSchedule = (start: string, end: string) =>
    apiClient(false, `/schedule?sportId=1&startDate=${start}&endDate=${end}&hydrate=game(tickets),broadcasts,seriesStatus`);

export const fetchGame = (gamePk: string, hydrations: string[] = []) =>
    apiClient(true, `/game/${gamePk}/feed/live${hydrations.length > 0 ? `?hydrate=${hydrations.join(',')}` : ''}`);

export const fetchContent = (gamePk: string) =>
    apiClient(false, `/game/${gamePk}/content`);

export const fetchWinProbability = (gamePk: string) =>
    apiClient(false, `/game/${gamePk}/winProbability`);
