// @ts-nocheck

import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import parse from 'html-react-parser';
import { Box, Skeleton, Typography, Link, Tooltip } from '@mui/material';
import { HiExternalLink } from 'react-icons/hi';

import $ from 'jquery';

import { Consts } from './consts.ts';
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
            if (!selectedGame) {
                setArticle(null);
                return;
            };

            try {
                const content = await fetchContent(selectedGame);
                const formattedArticle = transformGameArticle(content);
                setArticle(formattedArticle);
            } catch (error) {
                setArticle(null);
                console.error("News fetch failed:", error);
            }
        };

        getNews();
    }, [selectedGame]);

    return (
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
                                {article?.author.length > 0 ? `- ${article?.author}` : ''}
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
                    <Typography variant="body1" component="div">
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
    )
}
