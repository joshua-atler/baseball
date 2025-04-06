// @ts-nocheck

import * as React from 'react';
import ReactDOM from 'react-dom/client';

import { Box } from '@mui/material';

import $ from 'jquery';

import { Consts } from './consts.ts';
import '../../styles/style.css';


export default function News({ gamePk }) {

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


                // newsDiv.addClass('news-active');
                newsDiv.parent().show();
            }
        })();
    }, [gamePk]);


    return (
        <>
            <div id="news-content"></div>
            {/* <div style="overflow: hidden;">
                    <div id="news-content" style="width: 600px; float: left;">Left</div>
                    <div id="media-content" style="margin-left: 620px;">Right</div>
                </div>
                <div id="news-content"></div>
                <div id="media-content"></div> */}
        </>
    )
}