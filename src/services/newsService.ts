import { XMLParser } from 'fast-xml-parser';


const parseXMLtoJSON = (xmlString: string) => {
    const parser = new XMLParser({
        ignoreAttributes: false
    });
    return parser.parse(xmlString);
};


export const fetchRss = async (team: string): Promise<any[]> => {
    let apiUrl = import.meta.env.VITE_LOCAL === 'LOCAL'
        ? 'http://localhost:5000/api/rss'
        : '/api/rss';
    if (team.length > 0) {
        apiUrl = `${apiUrl}/${team}`;
    }

    try {
        console.log(apiUrl);
        const response = await fetch(apiUrl);
        console.log(response);
        const data = await response.text();

        const json = parseXMLtoJSON(data);
        const articles = json['rss']['channel']['item'];

        return articles;
    } catch (error) {
        console.error('Error fetching RSS:', error);
        return [];
    };

    // fetch(apiUrl)
    //     .then(response => response.text())
    //     .then(data => {
    //         const json = parseXMLtoJSON(data);
    //         const articles = json['rss']['channel']['item'];

    //         return articles;

    //         // setArticles([]);
    //         // articles.map((article, index) => {
    //         //     var formattedDate = new Date(article['pubDate']).toLocaleString('en-US', {
    //         //         month: 'numeric',
    //         //         day: 'numeric',
    //         //         year: 'numeric',
    //         //     });
    //         //     setArticles((prevArticles) => [...prevArticles, {
    //         //         title: article['title'],
    //         //         link: article['link'],
    //         //         pubDate: formattedDate,
    //         //         imageUrl: article?.['image']?.['@_href'] || null
    //         //     }]);
    //         // });
    //     })
    //     .catch(error => {
    //         console.error("Error fetching RSS:", error);
    //         return [];
    //     });
}

export const formatDate = (pubDate: string): string => {
    return new Date(pubDate).toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    });
}
