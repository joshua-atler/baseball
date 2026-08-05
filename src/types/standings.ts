export type StandingsForBoxscore = [string, string];

export type StandingsMode =
    'regular season' | 'wild card' | 'spring training' | 'line chart';

export type GroupingsMode = 'division' | 'league' | 'MLB';

export interface TeamRecord {
    team: {
        id: number;
        name: string;
        teamLogo: string;
        springLeague?: { id: number };
        [key: string]: any;
    };
    leagueRank: string;
    sportRank: string;
    springLeagueRank: string;
    [key: string]: any;
}

export interface FormattedStandings {
    division: string;
    teamRecords: TeamRecord[];
}

export interface LineChartDataset {
    division: string;
    teamRecords: Record<string, any>[];
}
