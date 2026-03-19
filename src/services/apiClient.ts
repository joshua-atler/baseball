const BASE_URL = 'https://statsapi.mlb.com/api/v1';

export const apiClient = async (endpoint: string) => {
    const url = `${BASE_URL}${endpoint}`;

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
