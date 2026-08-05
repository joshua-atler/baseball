import { apiClient } from './apiClient';

export const fetchTeamStats = (
    group: string,
    statsYear: number,
    statsGameType: string
) => {
    return apiClient(
        false,
        `/teams/stats?group=${group}&stats=season&season=${statsYear}&gameType=${statsGameType}&sportIds=1`
    );
};
