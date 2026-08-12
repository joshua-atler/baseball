import { createContext, useContext, useMemo, useState } from 'react';

import { TeamName } from '../consts/consts';
import { GameMetadata } from '../types/player';

export type TimeZone = 'ET' | 'CT' | 'MT' | 'PT';

interface BasedashProviderProps {
    children: React.ReactNode;
}

export interface BasedashContextType {
    selectedGame: number | null;
    setSelectedGame: React.Dispatch<React.SetStateAction<number | null>>;
    selectedGameMetadata: GameMetadata | null;
    setSelectedGameMetadata: React.Dispatch<
        React.SetStateAction<GameMetadata | null>
    >;
    selectedPlayer: number | null;
    setSelectedPlayer: React.Dispatch<React.SetStateAction<number | null>>;
    selectedTeam: TeamName | null;
    setSelectedTeam: React.Dispatch<React.SetStateAction<TeamName | null>>;
    timeZone: TimeZone;
    setTimeZone: React.Dispatch<React.SetStateAction<TimeZone>>;
}

const BasedashContext = createContext<BasedashContextType | undefined>(
    undefined
);

export const BasedashProvider = ({ children }: BasedashProviderProps) => {
    const [selectedGame, setSelectedGame] = useState<number | null>(null);
    const [selectedGameMetadata, setSelectedGameMetadata] =
        useState<GameMetadata | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<TeamName | null>(null);
    const [timeZone, setTimeZone] = useState<TimeZone>('ET');

    const state = useMemo<BasedashContextType>(
        () => ({
            selectedGame,
            setSelectedGame,
            selectedGameMetadata,
            setSelectedGameMetadata,
            selectedPlayer,
            setSelectedPlayer,
            selectedTeam,
            setSelectedTeam,
            timeZone,
            setTimeZone,
        }),
        [
            selectedGame,
            setSelectedGame,
            selectedGameMetadata,
            setSelectedGameMetadata,
            selectedPlayer,
            setSelectedPlayer,
            selectedTeam,
            setSelectedTeam,
            timeZone,
            setTimeZone,
        ]
    );

    return (
        <BasedashContext.Provider value={state}>
            {children}
        </BasedashContext.Provider>
    );
};

export const useBasedash = () => {
    const context = useContext(BasedashContext);
    if (!context) {
        throw new Error('useBasedash must be used within a BasedashProvider');
    }
    return context;
};
