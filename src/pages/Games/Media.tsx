// @ts-nocheck

import * as React from 'react';
import ReactDOM from 'react-dom/client';

import { Box } from '@mui/material';

import $ from 'jquery';

import { Consts } from './consts.ts';
import '../../styles/style.css';


export default function Media({ gamePk }) {

    React.useEffect(() => {
        (async () => {

            var newsDiv = $(document.querySelector('#news-content'));
            var gameContent = null;

            if (gamePk == null) {

                newsDiv.html('<p>Select a game</p>');
                // newsDiv.removeClass('news-active');
                // newsDiv.parent().hide();
            } else {
                // https://statsapi.mlb.com/api/v1/game/745538/content

                gameContent = await fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/content`);
                gameContent = await gameContent.json();

                // console.log(`game: ${gamePk}`);
                updateNewsContent(gameContent);
            }

            function updateNewsContent(gameContent) {
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


                // newsDiv.addClass('news-active');
                // newsDiv.parent().show();
            }
        })();
    }, [gamePk]);

    return (
        <>
            <div id="news-content"></div>
        </>
    )

}
