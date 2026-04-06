
import { apiClient } from './apiClient';

export const fetchStandings = (month: number, day: number, year: number) => 
    apiClient(false, `/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason&date=${month}/${day}/${year}`);
