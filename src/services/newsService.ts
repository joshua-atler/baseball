import { XMLParser } from 'fast-xml-parser';
import { useEffect, useState } from 'react';


interface Article {
    title: string,
    link: string,
    pubDate: string,
    imageUrl: string
}


const parseXMLtoJSON = (xmlString: string) => {
    const parser = new XMLParser({
        ignoreAttributes: false
    });
    return parser.parse(xmlString);
};

export const formatDate = (pubDate: string): string => {
    return new Date(pubDate).toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    });
}

export const useNews = (team: string) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        let apiUrl = import.meta.env.VITE_LOCAL === 'LOCAL'
            ? 'http://localhost:5000/api/rss'
            : '/api/rss';
        if (team.length > 0) {
            apiUrl = `${apiUrl}/${team}`;
        }

        const fetchNews = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(apiUrl);
                const data = await response.text();

                const json = parseXMLtoJSON(data);

                const rawItems = json?.rss?.channel?.item || [];
                const formattedArticles = rawItems.map((article) => ({
                    title: article['title'],
                    link: article['link'],
                    pubDate: formatDate(article['pubDate']),
                    imageUrl: article?.['image']?.['@_href'] || null
                }));

                setArticles(formattedArticles);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching RSS:', error);
                setArticles([]);
                setIsLoading(false);
            };
        };

        fetchNews();
    }, [team]);

    return { articles, isLoading };
}


