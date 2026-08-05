import { useMemo } from 'react';

export const useGameColumns = () => {
    const gamesColumns = useMemo(
        () => [
            { data: 'gamePk', title: '', visible: false },
            { data: 'gameMetadata', title: '', visible: false },
            { data: 'date', title: 'Date' },
            { data: 'time', title: 'Time' },
            { data: 'away', title: 'Away' },
            { data: 'awayScore', title: '' },
            { data: 'home', title: 'Home' },
            { data: 'homeScore', title: '' },
            { data: 'inning', title: 'Inning' },
            { data: 'status', title: 'Status' },
        ],
        []
    );

    return { gamesColumns };
};
