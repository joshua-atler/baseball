import { apiClient } from './apiClient';

export const fetchSeason = (year: number) =>
    apiClient(
        false,
        `http://statsapi.mlb.com/api/v1/seasons?season=${year}&sportId=1`
    );
