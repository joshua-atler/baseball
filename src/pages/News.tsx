import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography
} from '@mui/material';
import { useCallback, useState } from 'react';

import { TeamSelect } from '../components/TeamSelect.tsx';
import { Consts } from '../consts/consts.ts';
import { useBasedash } from '../context/BasedashContext.tsx';
import { useNews } from '../services/newsService.ts';
import { LoadingCircle } from '../components/LoadingCircle.tsx';


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
                    <Card sx={{ width: '20%'  }}>
                        <CardActionArea
                            href={link}
                            target={"_blank"}
                        >
                            <CardMedia
                                component='img'
                                sx={{ objectFit: 'fill' }}
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
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const { isMobileDevice } = useBasedash();
    const { articles, isLoading, isError } = useNews(selectedTeam ? Consts.teamInfo[selectedTeam].nickname : '');
    const newsTeamLogo = selectedTeam ? Consts.teamInfo[selectedTeam].logo : '';

    const handleTeamChange = useCallback((val) => {
        if (val.length === 1) {
            setSelectedTeam(val[0]);
        } else {
            setSelectedTeam(null);
        }
    }, []);

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
                    <Box sx={{ width: '100%', mb: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 2 }}>
                            {newsTeamLogo &&
                                <img src={newsTeamLogo} style={{ width: 80, height: 80 }} ></img>
                            }
                            <Typography variant='h6'>
                                {selectedTeam}
                            </Typography>
                            <Box sx={{ ml: 'auto', width: '600px' }}>
                                <TeamSelect
                                    currentValue={selectedTeam}
                                    onTeamChange={handleTeamChange}
                                    multiple={false} />
                            </Box>
                        </Box>
                        <Box sx={{ height: '30px', backgroundColor: selectedTeam ? Consts.teamInfo[selectedTeam].colors.primary : '' }}></Box>
                        <Box sx={{ height: '20px', backgroundColor: selectedTeam ? Consts.teamInfo[selectedTeam].colors.secondary : '' }}></Box>
                    </Box>

                    <Box sx={{ width: '90%', mx: 'auto', alignItems: 'center' }}>
                        {(() => {
                            if (isLoading) {
                                return <LoadingCircle size={60} />;
                            } else if (isError) {
                                return <Typography variant="h6">Error loading news</Typography>;
                            } else {
                                return <>
                                    <Box sx={{ width: '100%', justifyContent: 'space-between' }} display="flex" flexWrap="wrap" gap={4}>
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
