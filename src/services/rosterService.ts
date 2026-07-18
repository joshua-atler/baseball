import { apiClient } from './apiClient';

export const fetchRoster = (teamID: number) =>
    apiClient(false, `/teams/${teamID}/roster?rosterType=active`);

export const fetchPlayer = (playerID: number) =>
    apiClient(false, `/people/${playerID}`)

export const fetchAllPlayers = () =>
    apiClient(false, '/sports/1/players')