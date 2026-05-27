import { apiClient } from './apiClient';

export const fetchRoster = (teamID: number) =>
    apiClient(false, `/teams/${teamID}/roster?rosterType=active`);