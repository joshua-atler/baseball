/// <reference types="vite/client" />

declare global {
    interface Window {
        handleViewGameClick?: (gamePk: number) => void;
    }
}

export {};
