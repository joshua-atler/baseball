import { apiClient } from './apiClient';

export const fetchRoster = (teamID: number) =>
    apiClient(false, `/teams/${teamID}/roster?rosterType=active`);

export const fetchPlayer = (playerID: number) =>
    apiClient(false, `/people/${playerID}`)

export const fetchPlayerStats = (group: string, season: number) =>
    apiClient(false, `/stats?stats=season&group=${group}&season=${season}&limit=3000&sportId=1&playerPool=all`)

