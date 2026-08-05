export interface Award {
    name: string;
    dates: string[];
    teams: string[];
}

export interface PitcherStats {
    year: string;
    team: string;
    stats: PitchingMetrics;
}

export interface PitchingMetrics {
    age: number;
    gamesPlayed: number;
    gamesStarted: number;
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
    caughtStealingPercentage: string;
    groundIntoDoublePlay: number;
    numberOfPitches: number;
    era: string;
    inningsPitched: string;
    wins: number;
    losses: number;
    saves: number;
    saveOpportunities: number;
    holds: number;
    blownSaves: number;
    earnedRuns: number;
    whip: string;
    battersFaced: number;
    outs: number;
    gamesPitched: number;
    completeGames: number;
    shutouts: number;
    strikes: number;
    strikePercentage: string;
    hitBatsmen: number;
    balks: number;
    wildPitches: number;
    pickoffs: number;
    totalBases: number;
    groundOutsToAirouts: string;
    winPercentage: string;
    pitchesPerInning: string;
    gamesFinished: number;
    strikeoutWalkRatio: string;
    strikeoutsPer9Inn: string;
    walksPer9Inn: string;
    hitsPer9Inn: string;
    runsScoredPer9: string;
    homeRunsPer9: string;
    inheritedRunners: number;
    inheritedRunnersScored: number;
    catchersInterference: number;
    sacBunts: number;
    sacFlies: number;
}

export interface PitcherYearDetails {
    isLoading: boolean;
    year: string | null;
    pitchSpeeds: PitchSpeeds[] | null;
    pitchArsenal: PitchArsenal[] | null;
    gameLog: PitcherGameLog[] | null;
    playLog: any[] | null;
    pitchLog: PitchLog[] | null;
    error: boolean;
}

export interface PitchArsenal {
    pitchType: string;
    count: number;
}

export interface PitchSpeeds {
    pitchType: string;
    speed: number;
}

export interface PitchLog {
    [gamePk: number]: {
        [inning: number]: {
            pitch: object;
        };
    };
}

export interface PitcherGameLog {
    gamePk: number;
    gameMetadata: GameMetadata;
    date: string;
    matchup: string[];
    isWin: boolean;
    pitches: number;
    inningsPitched: string;
    earnedRuns: number;
    earnedRunAverage: string;
    hits: number;
    runs: number;
    strikeouts: number;
    walks: number;
    whip: string;
}

export interface GameMetadata {
    broadcasts: string[];
    seriesStatus: SeriesStatus;
}

export interface SeriesStatus {
    gameNumber: number;
    totalGames: number;
    isTied: boolean;
    isOver: boolean;
    wins: number;
    losses: number;
    description: string;
    shortDescription: string;
    result: string;
    shortName: string;
    abbreviation: string;
}

export interface HitterStats {
    year: string;
    team: string;
    stats: HittingMetrics;
}

export interface HittingMetrics {
    age: number;
    // -----------
}
