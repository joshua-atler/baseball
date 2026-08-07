export interface Media {
    title: string;
    imageURL: string;
    videoURL: string;
}

export interface Article {
    headline: string;
    author: string;
    imageURL: string;
    date: string;
    body: string;
    slug: string;
}

export type League = 'AL' | 'NL';

export interface SeasonBounds {
    start: Date;
    totalDays: number;
}
