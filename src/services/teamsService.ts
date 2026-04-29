
import { apiClient } from './apiClient';

export const fetchTeamDetails = (teamID: number) => 
    apiClient(false, `/teams/${teamID}`);

