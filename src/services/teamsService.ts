import { apiClient } from './apiClient';

export const fetchTeamDetails = (teamID: number) =>
    apiClient(false, `/teams/${teamID}`);

export const fetchTeams = () => apiClient(false, `/teams?sportId=1`);
