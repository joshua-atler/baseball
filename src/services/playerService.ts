import { apiClient } from './apiClient';

export const fetchPlayer = (playerID: number, group: string[] = [], type: string[] = [], season: number = -1) =>
    apiClient(false, `/people/${playerID}?hydrate=stats(group=[${group.join(',')}],type=[${type.join(',')}]${season !== -1 && `,season=${season}`})`);

export const fetchAwards = (playerID: number) =>
    apiClient(false, `/people/${playerID}?hydrate=awards`);
