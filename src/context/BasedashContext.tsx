import { createContext, useContext, useState } from 'react';

const BasedashContext = createContext(undefined);

export type TimeZone = 'ET' | 'CT' | 'MT' | 'PT';

export const BasedashProvider = ({children}) => {

    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [timeZone, setTimeZone] = useState<TimeZone>('ET');

    const isMobileDevice = () => {
        return (
            /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
        );
    };

    const state = {
        selectedGame,
        setSelectedGame,
        selectedPlayer,
        setSelectedPlayer,
        timeZone,
        setTimeZone,
        isMobileDevice
    }

    return (
        <BasedashContext.Provider value={{ ...state}}>
            {children}
        </BasedashContext.Provider>
    )
};

export const useBasedash = () => useContext(BasedashContext);