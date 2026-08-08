import { PitcherStats } from './player';

export interface AllPlayersPitcher {
    season: string;
    stat: PitcherStats;
    team: {
        id: number;
        name: string;
        link: string;
    };
    player: {
        id: number;
        firstName: string;
        fullName: string;
        lastName: string;
        link: string;
    };
    league: {
        id: number;
        name: string;
        link: string;
    };
    sport: {
        id: number;
        name: string;
        abbreviation: string;
    };
    numTeams: number;
    rank: number;
    position: {
        code: string;
        name: string;
        type: string;
        abbreviation: string;
    };
}
