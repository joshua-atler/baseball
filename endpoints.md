projected,projectedRos,yearByYear,yearByYearAdvanced,yearByYearPlayoffs,season,standard,advanced,career,careerRegularSeason,careerAdvanced,seasonAdvanced,careerStatSplits,careerPlayoffs,gameLog,playLog,pitchLog,metricLog,metricAverages,pitchArsenal,outsAboveAverage,expectedStatistics,sabermetrics,sprayChart,tracking,vsPlayer,vsPlayerTotal,vsPlayer5Y,vsTeam,vsTeam5Y,vsTeamTotal,lastXGames,byDateRange,byDateRangeAdvanced,byMonth,byMonthPlayoffs,byDayOfWeek,byDayOfWeekPlayoffs,homeAndAway,homeAndAwayPlayoffs,winLoss,winLossPlayoffs,rankings,rankingsByYear,statsSingleSeason,statsSingleSeasonAdvanced,hotColdZones,availableStats,opponentsFaced,gameTypeStats,firstYearStats,lastYearStats,statSplits,statSplitsAdvanced,atGameStart,vsOpponents,sabermetricsMultiTeam,projected_Zips,projected_ZipsRos,projected_Zips2YR,projected_Zips3YR



// [
//   {
//     "name": "",
//     "metricId": 0
//   },
//   {
//     "group": "pitching",
//     "name": "releaseSpinRate",
//     "unit": "RPM",
//     "metricId": 1000
//   },
//   {
//     "group": "pitching",
//     "name": "releaseExtension",
//     "unit": "FT",
//     "metricId": 1001
//   },
//   {
//     "group": "pitching",
//     "name": "releaseSpeed",
//     "unit": "MPH",
//     "metricId": 1002
//   },
//   {
//     "group": "pitching",
//     "name": "effectiveSpeed",
//     "unit": "MPH",
//     "metricId": 1028
//   },
//   {
//     "group": "hitting, pitching",
//     "name": "launchSpeed",
//     "unit": "MPH",
//     "metricId": 1003
//   },
//   {
//     "group": "hitting, pitching",
//     "name": "launchAngle",
//     "unit": "DEG",
//     "metricId": 1005
//   },
//   {
//     "group": "hitting, pitching",
//     "name": "generatedSpeed",
//     "unit": "MPH",
//     "metricId": 1044
//   },
//   {
//     "group": "hitting",
//     "name": "maxHeight",
//     "unit": "FT",
//     "metricId": 1039
//   },
//   {
//     "group": "hitting",
//     "name": "travelTime",
//     "unit": "SEC",
//     "metricId": 1049
//   },
//   {
//     "group": "hitting",
//     "name": "hangTime",
//     "unit": "SEC",
//     "metricId": 1027
//   },
//   {
//     "name": "opportunityTimeGround",
//     "metricId": 1091
//   },
//   {
//     "group": "hitting",
//     "name": "distance",
//     "unit": "FT",
//     "metricId": 1030
//   },
//   {
//     "group": "hitting",
//     "name": "travelDistance",
//     "unit": "FT",
//     "metricId": 1050
//   },
//   {
//     "group": "hitting",
//     "name": "hrDistance",
//     "unit": "FT",
//     "metricId": 1031
//   },
//   {
//     "group": "hitting",
//     "name": "hitTrajectory",
//     "unit": "String",
//     "metricId": 1033
//   },
//   {
//     "group": "hitting",
//     "name": "launchSpinRate",
//     "unit": "RPM",
//     "metricId": 1063
//   },
//   {
//     "group": "hitting",
//     "name": "barreledBall",
//     "unit": "String",
//     "metricId": 1076
//   },
//   {
//     "group": "pitching",
//     "name": "deliveryTime",
//     "unit": "SEC",
//     "metricId": 1161
//   },
//   {
//     "group": "fielding",
//     "name": "limbApexSkeletal",
//     "unit": "FT",
//     "metricId": 1159
//   },
//   {
//     "group": "pitching",
//     "name": "distanceToCatchersMittSkeletal",
//     "unit": "IN",
//     "metricId": 1160
//   },
//   {
//     "group": "hitting",
//     "name": "homeRunXBallparks",
//     "metricId": 17004
//   }
// ]



// all types, no metrics

https://statsapi.mlb.com/api/v1/people/519242?hydrate=stats(group=[pitching],type=[projected,projectedRos,yearByYear,yearByYearAdvanced,yearByYearPlayoffs,season,standard,advanced,career,careerRegularSeason,careerAdvanced,seasonAdvanced,careerStatSplits,careerPlayoffs,gameLog,playLog,pitchLog,metricLog,metricAverages,pitchArsenal,outsAboveAverage,expectedStatistics,sabermetrics,sprayChart,tracking,vsPlayer,vsPlayerTotal,vsPlayer5Y,vsTeam,vsTeam5Y,vsTeamTotal,lastXGames,byDateRange,byDateRangeAdvanced,byMonth,byMonthPlayoffs,byDayOfWeek,byDayOfWeekPlayoffs,homeAndAway,homeAndAwayPlayoffs,winLoss,winLossPlayoffs,rankings,rankingsByYear,statsSingleSeason,statsSingleSeasonAdvanced,hotColdZones,availableStats,opponentsFaced,gameTypeStats,firstYearStats,lastYearStats,statSplits,statSplitsAdvanced,atGameStart,vsOpponents,sabermetricsMultiTeam,projected_Zips,projected_ZipsRos,projected_Zips2YR,projected_Zips3YR],metrics=[releaseSpeed],limit=10000,season=2026)

https://statsapi.mlb.com/api/v1/people/${playerID}?&hydrate=stats(group=[pitching],type=[pitchArsenal,gameLog,metricAverage],metrics=[releaseSpeed],limit=10000,season=${year})

