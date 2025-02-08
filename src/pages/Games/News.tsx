// @ts-nocheck

import * as React from 'react';

import '../../styles/style.css';

import $ from 'jquery';

import { Consts } from './consts.ts';



export default function News({ gamePk }) {

    React.useEffect(() => {
        (async () => {

            var articleTab = document.querySelector('#article-tab');
            var mediaTab = document.querySelector('#media-tab');

            var newsDiv = $(document.querySelector('#news-content'));
            newsDiv.parent().hide();

            var gameContent = null;
            var selectedSide = 'article';

            if (gamePk == null) {

                newsDiv.html('');
                newsDiv.parent().hide();

                $(articleTab).css('background-color', '#555555');
                $(mediaTab).css('background-color', '#555555');
            } else {

                if (selectedSide == 'article') {
                    $(articleTab).css('background-color', '#0416c0');
                    $(mediaTab).css('background-color', '#555555');
                } else if (selectedSide == 'media') {
                    $(articleTab).css('background-color', '#555555');
                    $(mediaTab).css('background-color', '#0416c0');
                }

                // https://statsapi.mlb.com/api/v1/game/745538/content

                gameContent = await fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/content`);
                gameContent = await gameContent.json();

                console.log(`game: ${gamePk}`);

                updateNewsContent(gameContent, selectedSide);
            }

            function updateNewsContent(gameContent, selectedSide) {
                if (selectedSide == 'article') {
                    try {
                        var articleHeader = '';

                        articleHeader = `<h2>${gameContent['editorial']['recap']['mlb']['headline']}</h2>`;
                        if ('subhead' in gameContent['editorial']['recap']['mlb']) {
                            articleHeader += `<h3>${gameContent['editorial']['recap']['mlb']['subhead']}</h3>`;
                        }
                        articleHeader += `<img class="media" src="${gameContent['editorial']['recap']['mlb']['image']['cuts'][0]['src']}">`;

                        var articleBody = gameContent['editorial']['recap']['mlb']['body'];
                        var formattedArticleBody = articleBody.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                        newsDiv.html(articleHeader + formattedArticleBody);
                    } catch {
                        newsDiv.html('<p>No content</p>');
                    }

                } else if (selectedSide == 'media') {
                    try {
                        var mediaHighlights = gameContent['highlights']['highlights']['items'];
                        var mediaContent = '';

                        for (let i = 0; i < mediaHighlights.length; i++) {
                            var mediaURL = mediaHighlights[i]['playbacks'].filter(mediaHighlight => {
                                return mediaHighlight.name === 'mp4Avc'
                            })[0]['url'];
                            // mediaContent += `<video class="media" controls loading="lazy" poster="${mediaHighlights[i]['image']['cuts'][0]['src']}" data-src="${mediaURL}"></video>`;
                            mediaContent += `<video class="media" controls loading="lazy" poster="${mediaHighlights[i]['image']['cuts'][0]['src']}"><source src="${mediaURL}" type="video/mp4"></video>`;
                            mediaContent += `<p class="media-caption">${mediaHighlights[i]['headline']}</p>`;
                        }

                        newsDiv.html(mediaContent);

                        var videos = document.querySelectorAll('video.media');

                        videos.forEach((video) => {
                            video.addEventListener('play', function () {
                                videos.forEach((v) => {
                                    if (v !== video) {
                                        v.pause();
                                    }
                                });
                            });
                        });
                    } catch {
                        newsDiv.html('<p>No content</p>');
                    }
                }

                newsDiv.parent().show();
            }

            articleTab.onclick = function () {
                if (gamePk != null) {
                    selectedSide = 'article';
                    updateNewsContent(gameContent, selectedSide);
                    $(articleTab).css('background-color', '#0416c0');
                    $(mediaTab).css('background-color', '#555555');
                }
            };

            mediaTab.onclick = function () {
                if (gamePk != null) {
                    selectedSide = 'media';
                    updateNewsContent(gameContent, selectedSide);
                    $(articleTab).css('background-color', '#555555');
                    $(mediaTab).css('background-color', '#0416c0');
                }
            };
        })();
    }, [gamePk]);


    return (
        <>
            <table id="news">
                <thead>
                    <tr>
                        <th>
                            <span id="article-tab">Article</span>
                            <span id="media-tab">Media</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            {/* <div id="article-content"></div>
                                <div id="media-content"></div> */}
                            <div id="news-content"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
            {/* <div style="overflow: hidden;">
                    <div id="news-content" style="width: 600px; float: left;">Left</div>
                    <div id="media-content" style="margin-left: 620px;">Right</div>
                </div>
                <div id="news-content"></div>
                <div id="media-content"></div> */}
        </>
    )
}