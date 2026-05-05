
import { Consts } from '../consts/consts';
import { apiClient } from './apiClient';

export const fetchStandings = (month: number, day: number, year: number, standingsMode: string, groupingsMode: string) => {
    console.log('fetchStandings');
    console.log(standingsMode);
    switch (standingsMode) {
        case 'regular season':
            const standingsTypes = {
                'division': Consts.STANDING_TYPES.REGULAR_SEASON,
                'league': Consts.STANDING_TYPES.BY_LEAGUE,
                'MLB': Consts.STANDING_TYPES.BY_LEAGUE,
            };

            return apiClient(false, `/standings?leagueId=103,104&season=${year}&standingsTypes=${standingsTypes[groupingsMode]}&date=${month}/${day}/${year}`);
        case 'wild card':
            return apiClient(false, `/standings?leagueId=103,104&season=${year}&standingsTypes=wildCardWithLeaders&date=${month}/${day}/${year}`);
        case 'spring training':
            // todo
            return [];
    }
}

export const fetchDivision = (id: number) =>
    apiClient(false, `/divisions/${id}`);

export const fetchSeason = (year: number) =>
    apiClient(false, `/seasons/${year}?sportId=1`);
