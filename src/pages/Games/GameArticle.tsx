import { Box, Typography } from '@mui/material';
import parse from 'html-react-parser';
import { useEffect, useState } from 'react';
import { HiExternalLink } from 'react-icons/hi';

import { GameTabContent } from '../../components/GameTabContent.tsx';
import { useBasedash } from '../../context/BasedashContext.tsx';
import { fetchContent } from '../../services/gamesService.ts';
import { Article } from '../../types/game.ts';
import { transformGameArticle } from '../../utils/gameTransformers.ts';

export const GameArticle = () => {
    const { selectedGame } = useBasedash();
    const [article, setArticle] = useState<Article | null>(null);

    useEffect(() => {
        const getNews = async () => {
            if (!selectedGame) {
                setArticle(null);
                return;
            }

            try {
                const content = await fetchContent(selectedGame);
                const formattedArticle = transformGameArticle(content);
                setArticle(formattedArticle);
            } catch (error) {
                setArticle(null);
                console.error('News fetch failed:', error);
            }
        };

        getNews();
    }, [selectedGame]);

    return (
        <GameTabContent>
            {article ? (
                <>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {article?.headline}
                        </Typography>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            gap={2}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    display: 'inline-block',
                                    transform: 'skewX(-15deg)',
                                    marginLeft: '10px',
                                }}
                            >
                                {article?.author.length > 0
                                    ? `- ${article?.author}`
                                    : ''}
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 'bold' }}
                            >
                                {article?.date}
                            </Typography>
                            {
                                <Typography variant="h6">
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`https://www.mlb.com/news/${article?.slug}`}
                                    >
                                        {'mlb.com'}
                                        <HiExternalLink
                                            style={{ verticalAlign: 'middle' }}
                                        />
                                    </a>
                                </Typography>
                            }
                        </Box>
                    </Box>
                    <Box
                        component="img"
                        src={article?.imageURL}
                        sx={{
                            width: '100%',
                            objectFit: 'cover',
                        }}
                    />
                    <Typography variant="body1" component="div">
                        {parse(article?.body) ?? ''}
                    </Typography>
                </>
            ) : (
                <>
                    <Typography variant="h5">No content</Typography>
                </>
            )}
        </GameTabContent>
    );
};
