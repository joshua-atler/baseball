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

import $ from 'jquery';
import SlimSelect from 'slim-select';
import { XMLParser } from 'fast-xml-parser';

import { Consts } from '../consts/consts.ts';
import '../styles/style.css';
import '../styles/slimSelectStyle.css';
import { useBasedash } from '../context/BasedashContext.tsx';


const parseXMLtoJSON = (xmlString) => {
    const parser = new XMLParser({
        ignoreAttributes: false
    });
    return parser.parse(xmlString);
};

function NewsCard({ title, link, pubDate, imageUrl, isMobileDevice }) {
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

export default function News() {
    const [articles, setArticles] = useState([]);
    const [newsTeam, setNewsTeam] = React.useState<NewsTeam>({logo: '', label: ''});
    const { isMobileDevice } = useBasedash();

    function fetchRss(team) {
        var apiUrl;
        if (import.meta.env.VITE_LOCAL === 'LOCAL') {
            apiUrl = `http://localhost:5000/api/rss`;
        } else {
            apiUrl = `/api/rss`;
        }
        if (team.length > 0) {
            apiUrl = `${apiUrl}/${team}`;
        }

        fetch(apiUrl)
            .then(response => response.text())
            .then(data => {
                const json = parseXMLtoJSON(data);
                var articles = json['rss']['channel']['item'];

                setArticles([]);
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
    }

    function findTeamIndex(teamName) {
        for (const league in Consts.teams) {
            for (let divisionIndex = 0; divisionIndex < Consts.teams[league].length; divisionIndex++) {
                const division = Consts.teams[league][divisionIndex];
                const teamIndex = division.indexOf(teamName);

                if (teamIndex !== -1) {
                    return [league, divisionIndex, teamIndex];
                }
            }
        }

        return null;
    }

    interface NewsTeam {
        logo: string,
        label: string
    }


    useEffect(() => {

        const newsTeamLogo = $(document.querySelector('#news-team-logo'));
        const newsTeamLabel = $(document.querySelector('#news-team-label'));
        
        const newsTeamColorBanners = $(document.querySelectorAll('.news-team-color-banner'));
        var teamsSelect = document.querySelector('#news-teams-select');

        var newStylesheet = $('<link>', {
            rel: 'stylesheet',
            href: 'https://unpkg.com/slim-select@latest/dist/slimselect.css'
        });

        $('head').append(newStylesheet);

        var selectOptions = [];
        const divisionNames = ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West'];

        var leagues = ['AL', 'NL'];
        for (var league of leagues) {
            for (let i = 0; i < 3; i++) {
                var divisionData = Consts.teamAbbrs[league][i].map((team, index) => {
                    var teamPadded = team.padEnd(3, '\u00A0');
                    return {
                        text: team,
                        html: `<img width="30" height="30" style="vertical-align: middle; margin-right: 10px;" src="${Consts.teamsDetails[Consts.teams[league][i][index]].logo}" /><span style="font-family: monospace; font-size: 16px; font-weight: bold; line-height: 30px;">${teamPadded}</span>`,
                        value: [Consts.teams[league][i][index], Consts.teamNicknames[league][i][index]]
                    };
                });

                selectOptions.push(divisionData);
            }
        }

        var selectData = selectOptions.map((options, index) => {
            return {
                label: divisionNames[index],
                selectAll: true,
                options: options
            }
        });
        selectData.unshift({ placeholder: true, text: 'Select a team' });

        var teamsDropdown = new SlimSelect({
            select: teamsSelect,
            data: selectData,

            settings: {
                showSearch: false,
                placeholderText: 'All teams',
                closeOnSelect: true,
                allowDeselect: true
            },
            events: {
                beforeChange: (newVal, oldVal) => {
                    return true
                },
                afterChange: (newVal, oldVal) => {
                    var selectedTeam = teamsDropdown.getSelected()[0];
                    console.log(selectedTeam);

                    if (selectedTeam == 'Select a team') {
                        setNewsTeam({
                            logo: '',
                            label: ''
                        });
                        fetchRss('');
                    } else {
                        setNewsTeam({
                            logo: Consts.teamsDetails[selectedTeam[0]].logo,
                            label: selectedTeam[0] === 'Oakland Athletics' ? 'Athletics' : selectedTeam[0]
                        });
                        var teamIndex = findTeamIndex(selectedTeam[0]);
                        console.log(teamIndex);
                        newsTeamColorBanners.eq(0).css('background-color', Consts.teamColors[teamIndex[0]][teamIndex[1]][teamIndex[2]]);
                        newsTeamColorBanners.eq(1).css('background-color', Consts.teamSecondColors[teamIndex[0]][teamIndex[1]][teamIndex[2]]);
                        fetchRss(selectedTeam[1]);
                    }

                    var box = document.querySelectorAll('.ss-values .ss-value .ss-value-text');

                    for (let i = 0; i < box.length; i++) {
                        if (!box[i].innerHTML.includes('<img')) {
                            var teamPadded = box[i].innerHTML.padEnd(4, '\u00A0');
                            box[i].innerHTML = `<img width="30" height="30" style="vertical-align: middle; margin-right: 10px;" src="${Consts.teamsDetails[selectOptions.flat().filter((option) => option.text == box[i].innerHTML)[0].value][0]}" />`;
                        }
                    }

                    return true;
                }
            }
        });
        document.querySelectorAll('.ss-content').forEach(el => el.classList.add('roster-select'));
    }, []);

    return (
        <>
            {isMobileDevice() ? (
                <>
                    <Box>
                        <div style={{ height: '250px' }}>
                            <span id="news-team-logo" style={{ all: 'unset !important' }}></span>
                            <span id="news-team-label"></span>
                            <div className="news-team-color-banner" style={{ height: '30px' }}></div>
                            <div className="news-team-color-banner" style={{ height: '20px', marginBottom: '10px' }}></div>
                            <div id="news-teams-select-container" style={{ all: 'unset !important' }}>
                                <select id="news-teams-select"></select>
                            </div>
                        </div>
                    </Box>

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
                                    isMobileDevice={isMobileDevice()}
                                />
                            ))}
                        </Box>
                    </Box>
                </>
            ) : (
                <>
                    <Box sx={{ width: '70%', mb: 5 }}>
                        <Box sx={{ display: 'flex', height: 100, alignItems: 'center', gap: 4, mb: 2 }}>
                            {newsTeam.logo && 
                                <img src={newsTeam.logo} style={{width: 80, height: 80}} ></img>
                            }
                            <Typography variant='h6'>
                                {newsTeam.label}
                            </Typography>
                            <Box sx={{ ml: 'auto', width: '600px' }} id="news-teams-select-container">
                                <select id="news-teams-select"></select>
                            </Box>
                        </Box>
                        <div className="news-team-color-banner" style={{ height: '30px' }}></div>
                        <div className="news-team-color-banner" style={{ height: '20px', marginBottom: '10px' }}></div>
                        <Box sx={{ height: '30px', bgcolor: '#aabbcc' }} />
                        <Box sx={{ height: '20px', bgcolor: '#559999' }} />
                        <Box sx={{ height: '20px', bgcolor: '#99aa44' }} />
                    </Box>

                    <Box sx={{ width: "70%", alignItems: "center" }}>
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
                    </Box>
                </>
            )}
        </>
    );
}
