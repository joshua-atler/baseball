import { createContext, useContext, useMemo, useState, useEffect } from 'react';

const BasedashContext = createContext(undefined);

export type TimeZone = 'ET' | 'CT' | 'MT' | 'PT';

export const BasedashProvider = ({ children }) => {

    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [timeZone, setTimeZone] = useState<TimeZone>('ET');

    const isMobileDevice = () => {
        return (
            /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
        );
    };

    const state = useMemo(() => ({
        selectedGame,
        setSelectedGame,
        selectedPlayer,
        setSelectedPlayer,
        timeZone,
        setTimeZone,
        isMobileDevice
    }), [selectedGame, selectedPlayer, timeZone]);

    return (
        <BasedashContext.Provider value={{ ...state }}>
            {children}
        </BasedashContext.Provider>
    )
};

export const useBasedash = () => useContext(BasedashContext);