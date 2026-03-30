import { apiClient } from './apiClient';

export const fetchPlayer = (playerID: number, group: string[] = [], type: string[] = []) =>
    apiClient(false, `/people/${playerID}?hydrate=stats(group=[${group.join(',')}],type=[${type.join(',')}])`);
