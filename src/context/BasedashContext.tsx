import React, { createContext, useContext, useState } from 'react';



const BasedashContext = createContext(undefined);

export const BasedashProvider = ({children}) => {

    const [selectedGame, setSelectedGame] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const state = {
        selectedGame,
        setSelectedGame,
        selectedPlayer,
        setSelectedPlayer
    }

    return (
        <BasedashContext.Provider value={{ ...state}}>
            {children}
        </BasedashContext.Provider>
    )
};

export const useBasedash = () => useContext(BasedashContext);