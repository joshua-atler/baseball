import { createContext, useContext, useMemo, useState } from 'react';

const BasedashContext = createContext(undefined);

export type TimeZone = 'ET' | 'CT' | 'MT' | 'PT';

export const BasedashProvider = ({ children }) => {

    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedGameMetadata, setSelectedGameMetadata] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [timeZone, setTimeZone] = useState<TimeZone>('ET');

    const isMobileDevice = () => {
        return (
            /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
        );
    };

    const state = useMemo(() => ({
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
        isMobileDevice
    }),
        [
            selectedGame,
            selectedGameMetadata,
            selectedPlayer,
            selectedTeam,
            timeZone
        ]);

    return (
        <BasedashContext.Provider value={{ ...state }}>
            {children}
        </BasedashContext.Provider>
    )
};

export const useBasedash = () => useContext(BasedashContext);