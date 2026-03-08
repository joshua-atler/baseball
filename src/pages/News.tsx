// @ts-nocheck

import React, { useEffect, useState } from 'react';

import {
    Box,
    Button,
    Typography,
    Card,
    CardActionArea,
    CardActions,
    CardMedia,
    CardContent
} from '@mui/material';

import { Consts } from '../consts/consts.ts';
import '../styles/style.css';
import '../styles/slimSelectStyle.css';
import { useBasedash } from '../context/BasedashContext.tsx';
import { useNews } from '../services/newsService.ts';
import { string } from 'prop-types';
import { TeamSelect } from '../components/TeamSelect.tsx';


interface NewsTeam {
    logo: string,
    label: string
}

const NewsCard = ({ title, link, pubDate, imageUrl, isMobileDevice }) => {
    return (
        <>
            {isMobileDevice ? (
                <>
                    <Card>
                        <CardActionArea
                            href={link}
                            target={"_blank"}
                        >
                            <CardMedia
                                component='img'
                                href={link}
                                target={"_blank"}
                                sx={{ height: 225, objectFit: 'fill' }}
                                image={imageUrl}
                                title={title}
                            />
                            <CardContent>
                                <Typography gutterBottom variant='h6' component='div'>
                                    {title}
                                </Typography>
                                <Typography variant='body1'>{pubDate}</Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </>
            ) : (
                <>
                    <Card sx={{ width: 355 }}>
                        <CardActionArea
                            href={link}
                            target={"_blank"}
                        >
                            <CardMedia
                                component='img'
                                sx={{ height: 200, objectFit: 'fill' }}
                                image={imageUrl}
                                title={title}
                            />
                            <CardContent>
                                <Typography gutterBottom variant='subtitle1' component='div'>
                                    {title}
                                </Typography>
                                <Typography variant='subtitle2'>{pubDate}</Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </>
            )}
        </>
    );
}

export function News() {
    const [newsTeam, setNewsTeam] = useState<NewsTeam>({ logo: '', label: '' });
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const { isMobileDevice } = useBasedash();
    const { articles, isLoading, isError } = useNews(selectedTeam ? Consts.teamInfo[selectedTeam].nickname : '');


    const newsTeamLogo = selectedTeam ? `/teamLogos/${selectedTeam}.svg` : '';

    return (
        <>
            {isMobileDevice() ? (
                // <>
                //     <Box>
                //         <div style={{ height: '250px' }}>
                //             <span id="news-team-logo" style={{ all: 'unset !important' }}></span>
                //             <span id="news-team-label"></span>
                //             <div className="news-team-color-banner" style={{ height: '30px' }}></div>
                //             <div className="news-team-color-banner" style={{ height: '20px', marginBottom: '10px' }}></div>
                //             <div id="news-teams-select-container" style={{ all: 'unset !important' }}>
                //                 <select id="news-teams-select"></select>
                //             </div>
                //         </div>
                //     </Box>

                //     <Box sx={{ alignItems: "center" }} display="flex">
                //         <Box sx={{ alignItems: "center" }} display="flex" flexWrap="wrap" gap={2}>
                //             {articles.map((article, index) => (
                //                 <NewsCard
                //                     key={index}
                //                     title={article.title}
                //                     description={article.description}
                //                     link={article.link}
                //                     pubDate={article.pubDate}
                //                     imageUrl={article.imageUrl}
                //                     isMobileDevice={isMobileDevice()}
                //                 />
                //             ))}
                //         </Box>
                //     </Box>
                // </>
                <>
                </>
            ) : (
                <>
                    <Box sx={{ width: '70%', mb: 5 }}>
                        <Box sx={{ display: 'flex', height: 100, alignItems: 'center', gap: 4, mb: 2 }}>
                            {newsTeamLogo &&
                                <img src={newsTeamLogo} style={{ width: 80, height: 80 }} ></img>
                            }
                            <Typography variant='h6'>
                                {selectedTeam ? Consts.teamInfo[selectedTeam].name : ''}
                            </Typography>
                            <Box sx={{ ml: 'auto', width: '600px' }} id="news-teams-select-container">
                                <TeamSelect
                                    currentValue={selectedTeam}
                                    onTeamChange={(val) => setSelectedTeam(val)}
                                    multiple={false} />
                            </Box>
                        </Box>
                        <Box sx={{ height: '30px', backgroundColor: selectedTeam ? Consts.teamInfo[selectedTeam].primary : '' }}></Box>
                        <Box sx={{ height: '20px', backgroundColor: selectedTeam ? Consts.teamInfo[selectedTeam].secondary : '' }}></Box>
                    </Box>

                    <Box sx={{ width: "70%", alignItems: "center" }}>
                        {(() => {
                            if (isLoading) {
                                return <Typography variant="h6">Loading...</Typography>;
                            } else if (isError) {
                                return <Typography variant="h6">Error loading news</Typography>;
                            } else {
                                return <>
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
                                    </Box>
                                </>;
                            }
                        })()}
                    </Box>
                </>
            )}
        </>
    );
}
