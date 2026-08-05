export interface RosterPlayer {
    id: number;
    name: string;
    position: string;
    jerseyNumber: string;
    batThrow: string;
    weight: number;
    height: string;
    age: number;
    mlbDebut: string;
    type: {
        display: string;
        sort: number;
    };
}
