export interface FinalDestination {
    base: string;
    isOut: boolean;
}

export interface BaseRunners {
    batter: {
        id: number;
        link: string;
        batSide: {
            code: string;
            description: string;
        };
    };
    batterPosition: {
        code: string;
        name: string;
        type: string;
        abbreviation: string;
    };
    first?: boolean;
    second?: boolean;
    third?: boolean;
}
