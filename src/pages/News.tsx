// @ts-nocheck

import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Typography, Card, CardActionArea, CardActions, CardMedia, CardContent } from '@mui/material';

import $ from 'jquery';
import '../styles/style.css';
import '../styles/slimSelectStyle.css';
import SlimSelect from 'slim-select';
import { XMLParser } from 'fast-xml-parser';

import { Consts } from '../consts/consts.ts';


const parseXMLtoJSON = (xmlString) => {
    const parser = new XMLParser({
        ignoreAttributes: false
    });
    return parser.parse(xmlString);
};

function NewsCard({ title, link, pubDate, imageUrl }) {
    const navigate = useNavigate();

    return (
        // <Card sx={{ maxWidth: 345 }}>
        <Card sx={{ width: 400 }}>
            <CardActionArea onClick={() => window.open(link, '_blank')}>
                <CardMedia
                    component='image'
                    sx={{ height: 225, objectFit: 'fill' }}
                    // image="https://placecats.com/300/200"
                    image={imageUrl}
                    title={title}
                />
                <CardContent>
                    <Typography gutterBottom variant='h6' component='div'>
                        {title}
                    </Typography>
                    <Typography variant='body1'>{pubDate}</Typography>
                    {/* {teams.map((team, index) => (
                    <Box key={index} display="flex" gap={2} justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">{team}</Typography>
                        <Typography variant="body1">{dates[index]}</Typography>
                    </Box>
                ))} */}
                    {/* <Box sx={{ width: 250 }} display="flex" justifyContent="space-between" alignItems="center"> */}
                    {/* <Box display="flex" gap={2} justifyContent="space-between" alignItems="center">
                    <Typography variant="body">{teams}</Typography>
                    <Typography variant="body">{months}</Typography>
                </Box> */}
                </CardContent>
                {/* <CardActions>
                    <Button size="small">Share</Button>
                    <Button size="small">Learn More</Button>
                </CardActions> */}
            </CardActionArea>
        </Card>
    );
}

export default function News() {
    console.log('news');

    const [articles, setArticles] = React.useState([]);

    React.useEffect(() => {

        var apiUrl;
        console.log(import.meta.env.VITE_LOCAL);
        if (import.meta.env.VITE_LOCAL === "LOCAL") {
            apiUrl = 'http://localhost:5000/rss';
        } else {
            apiUrl = '/api/rss';
        }
        fetch(apiUrl)
            // fetch("http://localhost:5000/rss")
            // fetch('/api/rss')
            .then(response => response.text())
            .then(data => {
                const json = parseXMLtoJSON(data);
                var articles = json['rss']['channel']['item'];
                // if (Array.isArray(articles)) {
                //     articles = articles.slice(0, 50);
                // } else {
                //     articles = [articles];
                // }
                console.log(articles);

                articles.map((article, index) => {
                    var formattedDate = new Date(article['pubDate']).toLocaleString('en-US', {
                        month: 'numeric',
                        day: 'numeric',
                        year: 'numeric',
                    });
                    setArticles((prevArticles) => [...prevArticles, {
                        title: article['title'],
                        link: article['link'],
                        pubDate: formattedDate,
                        imageUrl: article?.['image']?.['@_href'] || null
                    }]);
                });
            })
            .catch(error => console.error("Error fetching RSS:", error));
    }, []);

    return (
        <>
            <Typography variant="h5" noWrap component="div">
                MLB News
            </Typography>
            {/* <Box width={400} display="flex" flexDirection="column" gap={2}> */}
            <Box sx={{ alignItems: "center" }} display="flex">
                <Box sx={{ alignItems: "center" }} display="flex" flexWrap="wrap" gap={2}>
                    {articles.map((article, index) => (
                        <NewsCard
                            key={index}
                            title={article.title}
                            description={article.description}
                            link={article.link}
                            pubDate={article.pubDate}
                            imageUrl={article.imageUrl}
                        />
                    ))}
                    {/* <NewsCard title="news" description="description" date="02/25/2025" />
                <NewsCard title="news" description="description" date="02/25/2025" />
                <NewsCard title="news" description="description" date="02/25/2025" /> */}
                </Box>
            </Box>
        </>
    );
}
