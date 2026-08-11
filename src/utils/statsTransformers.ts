import { Consts, TeamName } from '../consts/consts';
import {
    FieldingStats,
    HittingStats,
    PitchingStats,
    StatsSplit,
} from '../types/stats.ts';

export const transformHittingStats = (rawHittingStats: any): HittingStats[] => {
    if (rawHittingStats.stats.length === 0) {
        return [];
    }

    const hittingKeys = new Set([
        'runs',
        'hits',
        'doubles',
        'triples',
        'homeRuns',
        'rbi',
        'avg',
        'obp',
        'slg',
        'ops',
        'stolenBases',
    ]);

    const hittingStats = rawHittingStats.stats[0].splits.map(
        (split: StatsSplit) => ({
            team: {
                name: split.team.name,
                logo: Consts.teamInfo[split.team.name as TeamName].logo,
            },
            ...Object.fromEntries(
                Object.entries(split.stat).filter(([key]) =>
                    hittingKeys.has(key)
                )
            ),
        })
    );

    return hittingStats;
};

export const transformPitchingStats = (
    rawPitchingStats: any
): PitchingStats[] => {
    if (rawPitchingStats.stats.length === 0) {
        return [];
    }

    const pitchingKeys = new Set([
        'era',
        'inningsPitched',
        'hits',
        'runs',
        'homeRuns',
        'strikeOuts',
        'baseOnBalls',
        'avg',
        'whip',
        'shutouts',
        'saves',
    ]);

    const pitchingStats = rawPitchingStats.stats[0].splits.map(
        (split: StatsSplit) => ({
            team: {
                name: split.team.name,
                logo: Consts.teamInfo[split.team.name as TeamName].logo,
            },
            ...Object.fromEntries(
                Object.entries(split.stat).filter(([key]) =>
                    pitchingKeys.has(key)
                )
            ),
        })
    );

    return pitchingStats;
};

export const transformFieldingStats = (
    rawFieldingStats: any
): FieldingStats[] => {
    if (rawFieldingStats.stats.length === 0) {
        return [];
    }

    const fieldingKeys = new Set([
        'fielding',
        'chances',
        'assists',
        'putOuts',
        'doubles',
        'errors',
        'doublePlays',
        'triplePlays',
        'wildPitches',
    ]);

    const fieldingStats = rawFieldingStats.stats[0].splits.map(
        (split: StatsSplit) => ({
            team: {
                name: split.team.name,
                logo: Consts.teamInfo[split.team.name as TeamName].logo,
            },
            ...Object.fromEntries(
                Object.entries(split.stat).filter(([key]) =>
                    fieldingKeys.has(key)
                )
            ),
        })
    );

    return fieldingStats;
};
