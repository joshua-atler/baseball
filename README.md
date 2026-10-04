# BaseDash

Introduction
Basedash is a baseball dashboard featuring data pulled from the [MLB Stats API](https://github.com/joerex1418/mlb-statsapi-swagger-docs/blob/main/swagger-docs.json).

Live link: [BaseDash](https://basedash.vercel.app)

## Games

The games page has 3 main views: the list, the combined linescore/boxscore, and a group of tabs containing plays, news, media, team stats, and a live win probability graph.

### Games List

By default, the games list loads today's games. Each game is a row in a table featuring the date, start time, away team and runs, home team and runs, inning number and baserunners, and the game status.

![Games List](/doc_images/games_list.png)

Above the games list are the game filters.

![Game Filters](/doc_images/games_controls.png)

The list of games can be filtered to include a date or range of dates as well as for specific teams.

The Yesterday, Today, and Tomorrow buttons are a quick way to select those days without using the date picker.

The Update button refreshes the page, and the Auto Update checkbox will refresh the scores every 5 seconds if checked.

### Linescore/Boxscore

A game can be selected by clicking on a row in the games list.

![Linescore Boxscore](/doc_images/linescore_boxscore.png)

The linescore shows the runs scored by each team in each inning, and the boxscore shows each players stats. The team whose players are listed in the boxscore can be toggled by clicking on the team name directly above the batters table. Both the batters and pitchers are included. Each player is a link to that player's profile on the **Players** page.

The game story can be viewed by clicking the **Recap** link, and the **mlb.com** button links to the official MLB Gameday page.

### Tabs

#### Plays

The **Plays** tab includes dropdowns for each half inning.

Each play includes the following content on its header row:

- a short description of the result
- the number of outs recorded after the play is over (filled circles indicate outs)
- the baserunners before and after the play
- the player name
- the player photo

Each play is itself also a dropdown, which includes a diagram of the strike zone with the location of the pitches (from the catcher's point of view).

The pitches are also listed in order and contain the following content:

- pitch number colored with
    - green for balls
    - red for strikes
    - blue for batted balls
- the count (balls-strikes) after the pitch
- the pitch type
- the umpire's call
- a link to the pitch on BaseballSavant
- the pitch speed in MPH

![Media](/doc_images/tabs_plays.png)

[![Pitch Video Highlight](./doc_images/tabs_plays_video_preview.png)](https://baseballsavant.mlb.com/sporty-videos?playId=a9cae4f7-2c64-30de-a96b-9b69a21cb899)

#### News

The **News** tab features an article that is written shortly after the game is over. The article can also be viewed on **mlb.com** using the link next to the author and date.

![News](/doc_images/tabs_news.png)

#### Media

The **Media** tab includes at least 20 vidoes from the game. The first 2 videos are short highlights (about 3 minutes) and a longer condensed game (10 - 20 minutes). For upcoming games, several short videos are included highlighting bullpen availability and probable starting pitchers.

![Media](/doc_images/tabs_media.png)

#### Stats

The **Stats** tab includes numerous stats for each team across _Hitting_, _Pitching_, and _Fielding Groups_. The better value (higher or lower depending on the stat) is highlighted green.

![Stats](/doc_images/tabs_stats.png)

#### Win Probability

The **Win Probability** tab displays a chart showing the home team's chance of winning the game at each at bat. Each half inning slice is highlighted with the color team that is batting.

Hovering over each point will show the following:

- the win probability (between 0 and 100)
- the description of the At Bat result
- the half inning (ex. "top 4" or "bottom 5")
- the current runs for each team

![Win Probability](/doc_images/tabs_win_prob.png)

## Players

## News

## Stats

## Standings

## Settings
