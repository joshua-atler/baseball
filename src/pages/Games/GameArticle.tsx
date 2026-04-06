// @ts-nocheck

import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import parse from 'html-react-parser';
import { Box, Skeleton, Typography, Link, Tooltip } from '@mui/material';
import { HiExternalLink } from 'react-icons/hi';

import $ from 'jquery';

import { Consts } from './consts.ts';
import '../../styles/style.css';
import { GameTabContent } from '../../components/GameTabContent.tsx';
import { PlayerPhoto } from '../../components/PlayerPhoto.tsx';
import { fetchContent } from '../../services/gamesService.ts';
import { useBasedash } from '../../context/BasedashContext.tsx';
import { transformGameArticle } from '../../utils/gameTransformers.ts';

export default function GameArticle() {

    const { selectedGame } = useBasedash();
    const [article, setArticle] = useState(null);

    useEffect(() => {
        const getNews = async () => {
            if (!selectedGame) return;

            try {
                const content = await fetchContent(selectedGame);
                const formattedArticle = transformGameArticle(content);
                setArticle(formattedArticle);
            } catch (error) {
                console.error("News fetch failed:", error);
            }
        };

        getNews();
    }, [selectedGame]);

    // useEffect(() => {
    //     (async () => {

    //         var newsDiv = $(document.querySelector('#news-content'));
    //         var gameContent = null;

    //         if (gamePk == null) {

    //             newsDiv.html('<p>Select a game</p>');
    //             // newsDiv.removeClass('news-active');
    //             // newsDiv.parent().hide();
    //         } else {
    //             // https://statsapi.mlb.com/api/v1/game/745538/content

    //             gameContent = await fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/content`);
    //             gameContent = await gameContent.json();

    //             // console.log(`game: ${gamePk}`);
    //             updateNewsContent(gameContent);
    //         }

    //         function updateNewsContent(gameContent) {
    //                 try {
    //                     var articleHeader = '';

    //                     articleHeader = `<h2>${gameContent['editorial']['recap']['mlb']['headline']}</h2>`;
    //                     if ('subhead' in gameContent['editorial']['recap']['mlb']) {
    //                         articleHeader += `<h3>${gameContent['editorial']['recap']['mlb']['subhead']}</h3>`;
    //                     }
    //                     articleHeader += `<img class="media" src="${gameContent['editorial']['recap']['mlb']['image']['cuts'][0]['src']}">`;

    //                     var articleBody = gameContent['editorial']['recap']['mlb']['body'];
    //                     var formattedArticleBody = articleBody.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    //                     newsDiv.html(articleHeader + formattedArticleBody);
    //                 } catch {
    //                     newsDiv.html('<p>No content</p>');
    //                 }


    //             // newsDiv.addClass('news-active');
    //             newsDiv.parent().show();
    //         }
    //     })();
    // }, [gamePk]);

    return (
        <>
            <GameTabContent>
                {article ?
                    <>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: "bold" }}>{article?.headline}</Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        display: 'inline-block',
                                        transform: 'skewX(-15deg)',
                                        marginLeft: '10px'
                                    }}
                                >
                                    {`- ${article?.author}`}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{article?.date}</Typography>
                                {<Typography variant="h6"><a target="_blank" rel="noopener noreferrer" href={`https://www.mlb.com/news/${article?.slug}`}>
                                    {'mlb.com'}<HiExternalLink style={{ verticalAlign: 'middle' }} />
                                </a></Typography>}
                            </Box>
                        </Box>
                        <Box
                            component="img"
                            src={article?.imageURL}
                            sx={{
                                width: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        <Typography variant="body1">
                            {parse(article?.body, {
                                replace: (domNode) => {
                                    if (domNode.name === 'forge-entity') {
                                        const slug = domNode.attribs.slug.split('-');
                                        const playerID = slug[slug.length - 1];
                                        return (
                                            <Tooltip title={<PlayerPhoto playerID={playerID} width={150} height={150} />}>
                                                <Link
                                                    href={`/player/${playerID}`}
                                                    sx={{ fontWeight: 'bold', color: 'primary.main', textDecoration: 'none' }}
                                                >
                                                    {domNode.children[0].data}
                                                </Link>

                                            </Tooltip>
                                        );
                                    }
                                }
                            })}
                        </Typography>
                    </> :
                    <>
                        <Typography variant="h5">No content</Typography>
                        {/* <Box sx={{ mb: 1 }}>
                            {Array.from({ length: 2 }).map((i) => {
                                return <Skeleton key={i} height={50} />
                            })}
                        </Box>
                        <Skeleton height={200} />
                        {Array.from({ length: 20 }).map((i) => {
                            return <Skeleton key={i} />
                        })} */}
                    </>
                }
            </GameTabContent>
            {/* <div id="news-content"></div> */}
            {/* <div style="overflow: hidden;">
                    <div id="news-content" style="width: 600px; float: left;">Left</div>
                    <div id="media-content" style="margin-left: 620px;">Right</div>
                </div>
                <div id="news-content"></div>
                <div id="media-content"></div> */}
        </>
    )
}