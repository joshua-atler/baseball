const BASE_URL = 'https://statsapi.mlb.com/api';
const BASE_URL_V1 = BASE_URL + '/v1';
const BASE_URL_V1dot1 = BASE_URL + '/v1.1';

export const apiClient = async (v1dot1: boolean, endpoint: string) => {
    let url = '';
    if (!v1dot1) {
        url = `${BASE_URL_V1}${endpoint}`;
    } else {
        url = `${BASE_URL_V1dot1}${endpoint}`;
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Fetch failed for ${url}:`, error);
        throw error;
    }
};
