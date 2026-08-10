export interface RawArticle {
    title: string;
    link: string;
    pubDate: string;
    image?: {
        '@_href'?: string;
    };
    [key: string]: any;
}

export interface FormattedArticle {
    title: string;
    link: string;
    pubDate: string;
    imageUrl: string | null;
}
