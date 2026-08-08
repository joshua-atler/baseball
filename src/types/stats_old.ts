export interface HittingStats {
    team: {
        name: string;
        logo: string;
    },
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
    },
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

export interface FieldingStats {
    team: {
        name: string;
        logo: string
    },
    fielding: string;
    chances: string;
    assists: string;
    putOuts: string;
    errors: string;
    doublePlays: string;
    triplePlays: string;
    wildPitches: string;
}