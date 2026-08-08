export interface TeamGameStats {
    away: {
        stats: {
            hitting: HittingGameStats;
            pitching: PitchingGameStats;
            fielding: FieldingGameStats;
        };
        team: GameStatsTeam;
    };
    home: {
        stats: {
            hitting: HittingGameStats;
            pitching: PitchingGameStats;
            fielding: FieldingGameStats;
        };
        team: GameStatsTeam;
    };
}

export interface StatsRow {
    stat: string;
    away: number | string;
    home: number | string;
}

export interface GameStatsTeam {
    abbr: string;
    colors: {
        primary: string;
        secondary: string;
    };
    id: number;
    logo: string;
    nickname: string;
}

export interface HittingGameStats {
    flyOuts: number;
    groundOuts: number;
    airOuts: number;
    runs: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    strikeOuts: number;
    baseOnBalls: number;
    intentionalWalks: number;
    hits: number;
    hitByPitch: number;
    avg: string;
    atBats: number;
    obp: string;
    slg: string;
    ops: string;
    caughtStealing: number;
    stolenBases: number;
    stolenBasePercentage: string;
    groundIntoDoublePlay: number;
    groundIntoTriplePlay: number;
    plateAppearances: number;
    totalBases: number;
    rbi: number;
    leftOnBase: number;
    sacBunts: number;
    sacFlies: number;
    catchersInterference: number;
    pickoffs: number;
    atBatsPerHomeRun: string;
    popOuts: number;
    lineOuts: number;
}

export interface PitchingGameStats {
    flyOuts: number;
    groundOuts: number;
    airOuts: number;
    runs: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    strikeOuts: number;
    baseOnBalls: number;
    intentionalWalks: number;
    hits: number;
    hitByPitch: number;
    atBats: number;
    obp: string;
    caughtStealing: number;
    stolenBases: number;
    stolenBasePercentage: string;
    caughtStealingPercentage: string;
    numberOfPitches: number;
    era: string;
    inningsPitched: string;
    saveOpportunities: number;
    earnedRuns: number;
    whip: string;
    battersFaced: number;
    outs: number;
    completeGames: number;
    shutouts: number;
    pitchesThrown: number;
    balls: number;
    strikes: number;
    strikePercentage: string;
    hitBatsmen: number;
    balks: number;
    wildPitches: number;
    pickoffs: number;
    groundOutsToAirouts: string;
    rbi: number;
    pitchesPerInning: string;
    runsScoredPer9: string;
    homeRunsPer9: string;
    inheritedRunners: number;
    inheritedRunnersScored: number;
    catchersInterference: number;
    sacBunts: number;
    sacFlies: number;
    passedBall: number;
    popOuts: number;
    lineOuts: number;
}

export interface FieldingGameStats {
    caughtStealing: number;
    stolenBases: number;
    stolenBasePercentage: string;
    caughtStealingPercentage: string;
    assists: number;
    putOuts: number;
    errors: number;
    chances: number;
    passedBall: number;
    pickoffs: number;
}
