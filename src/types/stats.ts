export type StatsGameType = 'Regular Season' | 'Postseason' | 'Spring Training';
export type StatsMode = 'hitting' | 'pitching' | 'fielding';

export interface FieldingStats {
    team: {
        name: string;
        logo: string;
    };
    fielding: string;
    chances: number;
    assists: number;
    putOuts: number;
    errors: number;
    doublePlays: number;
    triplePlays: number;
    wildPitches: number;
}

export interface HittingStats {
    team: {
        name: string;
        logo: string;
    };
    runs: number;
    hits: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    rbi: number;
    avg: string;
    obp: string;
    slg: string;
    ops: string;
    stolenBases: number;
}

export interface PitchingStats {
    team: {
        name: string;
        logo: string;
    };
    era: string;
    inningsPitched: string;
    hits: number;
    runs: number;
    homeRuns: number;
    strikeOuts: number;
    baseOnBalls: number;
    avg: string;
    whip: string;
    shutouts: number;
    saves: number;
}

export interface StatsTeam {}
