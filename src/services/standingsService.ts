import { Consts } from '../consts/consts';
import { apiClient } from './apiClient';

export const fetchStandings = (
    month: number,
    day: number,
    year: number,
    standingsMode: string,
    groupingsMode: string
) => {
    const standingsTypes = {
        division: Consts.STANDING_TYPES.REGULAR_SEASON,
        league: Consts.STANDING_TYPES.BY_LEAGUE,
        MLB: Consts.STANDING_TYPES.BY_LEAGUE,
    } as const;
    const standingsType =
        standingsTypes[groupingsMode as keyof typeof standingsTypes];

    switch (standingsMode) {
        case 'regular season':
            return apiClient(
                false,
                `/standings?leagueId=103,104&season=${year}&standingsTypes=${standingsType}&date=${month}/${day}/${year}`
            );
        case 'wild card':
            return apiClient(
                false,
                `/standings?leagueId=103,104&season=${year}&standingsTypes=wildCardWithLeaders&date=${month}/${day}/${year}`
            );
        case 'spring training':
            return apiClient(
                false,
                `/standings?leagueId=103,104&season=${year}&standingsTypes=springTraining&date=${month}/${day}/${year}`
            );
        case 'default':
            return '';
    }
};

export const fetchLineChartStandings = (startDate: string, endDate: string) => {
    return apiClient(
        false,
        `/schedule?sportId=1&startDate=${startDate}&endDate=${endDate}`
    );
};

export const fetchDivision = (id: number) =>
    apiClient(false, `/divisions/${id}`);

export const fetchSeason = (year: number) =>
    apiClient(false, `/seasons/${year}?sportId=1`);
