// @ts-nocheck

import * as svgsConst from './svg/*.js';
const svgsConst = import.meta.glob('./svg/*.js', { eager: true });

let svgs = JSON.parse(JSON.stringify(svgsConst));

svgs = Object.assign({}, ...Object.values(svgs));

Object.keys(svgs).forEach(key => {
    svgs[key] = 'data:image/svg+xml;base64,' + btoa(svgs[key])
});


class Consts {
    static teams = {
        'AL': [
            ['New York Yankees', 'Baltimore Orioles', 'Boston Red Sox', 'Tampa Bay Rays', 'Toronto Blue Jays'],
            ['Cleveland Guardians', 'Kansas City Royals', 'Detroit Tigers', 'Minnesota Twins', 'Chicago White Sox'],
            ['Texas Rangers', 'Houston Astros', 'Los Angeles Angels', 'Seattle Mariners', 'Oakland Athletics']
        ],
        'NL': [
            ['Atlanta Braves', 'Philadelphia Phillies', 'New York Mets', 'Washington Nationals', 'Miami Marlins'],
            ['Milwaukee Brewers', 'Chicago Cubs', 'Cincinnati Reds', 'St. Louis Cardinals', 'Pittsburgh Pirates'],
            ['Los Angeles Dodgers', 'San Diego Padres', 'San Francisco Giants', 'Arizona Diamondbacks', 'Colorado Rockies']
        ]
    };

    static teamNicknames = {
        'AL': [
            ['yankees', 'orioles', 'redsox', 'rays', 'bluejays'],
            ['guardians', 'royals', 'tigers', 'twins', 'whitesox'],
            ['rangers', 'astros', 'angels', 'mariners', 'athletics']
        ],
        'NL': [
            ['braves', 'phillies', 'mets', 'nationals', 'marlins'],
            ['brewers', 'cubs', 'reds', 'cardinals', 'pirates'],
            ['dodgers', 'padres', 'giants', 'dbacks', 'rockies']
        ]
    };

    static teamAbbrs = {
        'AL': [
            ['NYY', 'BAL', 'BOS', 'TB', 'TOR'],
            ['CLE', 'KC', 'DET', 'MIN', 'CWS'],
            ['TEX', 'HOU', 'LAA', 'SEA', 'OAK']
        ],
        'NL': [
            ['ATL', 'PHI', 'NYM', 'WSH', 'MIA'],
            ['MIL', 'CHC', 'CIN', 'STL', 'PIT'],
            ['LAD', 'SD', 'SF', 'AZ', 'COL']
        ]
    }

    static teamColors = {
        'AL': [
            [
                'rgb(19, 36, 72)', 'rgb(223, 70, 1)', 'rgb(189, 48, 57)', 'rgb(9, 44, 92)', 'rgb(19, 74, 142)',
            ],
            [
                'rgb(12, 35, 63)', 'rgb(0, 70, 135)', 'rgb(12, 35, 64)', 'rgb(211, 17, 69)', 'rgb(0, 0, 0)',
            ],
            [
                'rgb(0, 50, 120)', 'rgb(235, 110, 31)', 'rgb(186, 0, 33)', 'rgb(0, 92, 92)', 'rgb(0, 56, 49)',
            ]
        ],
        'NL': [
            [
                'rgb(206, 17, 65)', 'rgb(232, 24, 40)', 'rgb(0, 45, 114)', 'rgb(171, 0, 3)', 'rgb(0, 163, 224)',
            ],
            [
                'rgb(255, 197, 47)', 'rgb(14, 51, 134)', 'rgb(198, 1, 31)', 'rgb(196, 30, 58)', 'rgb(253, 184, 39)',
            ],
            [
                'rgb(0, 90, 156)', 'rgb(47, 36, 29)', 'rgb(253, 90, 30)', 'rgb(167, 25, 48)', 'rgb(51, 0, 102)',
            ]
        ]
    };

    static teamSecondColors = {
        'AL': [
            [
                'rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(12, 35, 64)', 'rgb(245, 209, 48)', 'rgb(232, 41, 28)',
            ],
            [
                'rgb(229, 0, 34)', 'rgb(189, 155, 96)', 'rgb(250, 70, 22)', 'rgb(0, 43, 92)', 'rgb(196, 206, 212)',
            ],
            [
                'rgb(192, 17, 31)', 'rgb(0, 45, 98)', 'rgb(196, 206, 212)', 'rgb(12, 44, 86)', 'rgb(239, 178, 30)',
            ]
        ],
        'NL': [
            [
                'rgb(19, 39, 79)', 'rgb(107, 172, 228)', 'rgb(252, 89, 16)', 'rgb(20, 34, 90)', 'rgb(239, 51, 64)',
            ],
            [
                'rgb(18, 40, 75)', 'rgb(204, 52, 51)', 'rgb(0, 0, 0)', 'rgb(254, 219, 0)', 'rgb(0, 0, 0)',
            ],
            [
                'rgb(255, 255, 255)', 'rgb(255, 196, 37)', 'rgb(0, 0, 0)', 'rgb(227, 212, 173)', 'rgb(196, 206, 212)',
            ]
        ]
    };

    static teamsDetails = {
        'Texas Rangers': [
            svgs['texasRangers'],
            'https://en.wikipedia.org/wiki/Globe_Life_Field',
            'Globe Life Field',
            [32.750156, -97.081117]
        ],
        'Houston Astros': [
            svgs['houstonAstros'],
            'https://en.wikipedia.org/wiki/Minute_Maid_Park',
            'Minute Maid Park',
            [29.76045, -95.369784]
        ],
        'Los Angeles Angels': [
            svgs['losAngelesAngels'],
            'https://en.wikipedia.org/wiki/Angel_Stadium',
            'Angel Stadium',
            [33.799572, -117.889031]
        ],
        'Seattle Mariners': [
            svgs['seattleMariners'],
            'https://en.wikipedia.org/wiki/Minute_Maid_Park',
            'T-Mobile Park',
            [47.60174, -122.330829]
        ],
        'Oakland Athletics': [
            svgs['oaklandAthletics'],
            'https://en.wikipedia.org/wiki/Oakland_Coliseum',
            'Oakland Coliseum',
            [37.74923, -122.196487]
        ],
        'Cleveland Guardians': [
            svgs['clevelandGuardians'],
            'https://en.wikipedia.org/wiki/Progressive_Field',
            'Progressive Field',
            [41.495149, -81.68709]
        ],
        'Kansas City Royals': [
            svgs['kansasCityRoyals'],
            'https://en.wikipedia.org/wiki/Kauffman_Stadium',
            'Kauffman Stadium',
            [39.10222, -94.583559]
        ],
        'Detroit Tigers': [
            svgs['detroitTigers'],
            'https://en.wikipedia.org/wiki/Comerica_Park',
            'Comerica Park',
            [42.346354, -83.059619]
        ],
        'Minnesota Twins': [
            svgs['minnesotaTwins'],
            'https://en.wikipedia.org/wiki/Target_Field',
            'Target Field',
            [44.974346, -93.259616]
        ],
        'Chicago White Sox': [
            svgs['chicagoWhiteSox'],
            'https://en.wikipedia.org/wiki/Guaranteed_Rate_Field',
            'Guaranteed Rate Field',
            [41.830883, -87.635083]
        ],
        'New York Yankees': [
            svgs['newYorkYankees'],
            'https://en.wikipedia.org/wiki/Yankee_Stadium',
            'Yankee Stadium',
            [40.819782, -73.929939]
        ],
        'Baltimore Orioles': [
            svgs['baltimoreOrioles'],
            'https://en.wikipedia.org/wiki/Oriole_Park_at_Camden_Yards',
            'Oriole Park at Camden Yards',
            [39.285243, -76.620103]
        ],
        'Boston Red Sox': [
            svgs['bostonRedSox'],
            'https://en.wikipedia.org/wiki/Fenway_Park',
            'Fenway Park',
            [42.346613, -71.098817]
        ],
        'Tampa Bay Rays': [
            svgs['tampaBayRays'],
            'https://en.wikipedia.org/wiki/Tropicana_Field',
            'Tropicana Field',
            [27.768487, -82.648191]
        ],
        'Toronto Blue Jays': [
            // 'https://upload.wikimedia.org/wikipedia/en/6/68/Toronto_Blue_Jays_cap.svg',
            svgs['torontoBlueJays'],
            'https://en.wikipedia.org/wiki/Rogers_Centre',
            'Rogers Centre',
            [43.641653, -79.3917]
        ],
        'Los Angeles Dodgers': [
            // 'https://upload.wikimedia.org/wikipedia/commons/f/f6/LA_Dodgers.svg',
            svgs['losAngelesDodgers'],
            'https://en.wikipedia.org/wiki/Dodger_Stadium',
            'Dodger Stadium',
            [34.072437, -118.246879]
        ],
        'San Diego Padres': [
            svgs['sanDiegoPadres'],
            'https://en.wikipedia.org/wiki/Petco_Park',
            'Petco Park',
            [32.752148, -117.143635]
        ],
        'San Francisco Giants': [
            // 'https://upload.wikimedia.org/wikipedia/commons/4/49/San_Francisco_Giants_Cap_Insignia.svg',
            svgs['sanFranciscoGiants'],
            'https://en.wikipedia.org/wiki/Oracle_Park',
            'Oracle Park',
            [37.77987, -122.389754]
        ],
        'Arizona Diamondbacks': [
            svgs['arizonaDiamondbacks'],
            'https://en.wikipedia.org/wiki/Chase_Field',
            'Chase Field',
            [33.452922, -112.038669]
        ],
        'Colorado Rockies': [
            svgs['coloradoRockies'],
            'https://en.wikipedia.org/wiki/Coors_Field',
            'Coors Field',
            [39.75698, -104.965329]
        ],
        'Milwaukee Brewers': [
            svgs['milwaukeeBrewers'],
            'https://en.wikipedia.org/wiki/American_Family_Field',
            'American Family Field',
            [43.04205, -87.905599]
        ],
        'Chicago Cubs': [
            svgs['chicagoCubs'],
            'https://en.wikipedia.org/wiki/Wrigley_Field',
            'Wrigley Field',
            [41.947201, -87.656413]
        ],
        'Cincinnati Reds': [
            svgs['cincinnatiReds'],
            'https://en.wikipedia.org/wiki/Great_American_Ball_Park',
            'Great American Ball Park',
            [39.107183, -84.507713]
        ],
        'St. Louis Cardinals': [
            svgs['stLouisCardinals'],
            'https://en.wikipedia.org/wiki/Busch_Stadium',
            'Busch Stadium',
            [38.629683, -90.188247]
        ],
        'Pittsburgh Pirates': [
            svgs['pittsburghPirates'],
            'https://en.wikipedia.org/wiki/PNC_Park',
            'PNC Park',
            [40.461503, -80.008924]
        ],
        'Atlanta Braves': [
            svgs['atlantaBraves'],
            'https://en.wikipedia.org/wiki/Truist_Park',
            'Truist Park',
            [33.74691, -84.391239]
        ],
        'Philadelphia Phillies': [
            svgs['philadelphiaPhillies'],
            'https://en.wikipedia.org/wiki/Citizens_Bank_Park',
            'Citizens Bank Park',
            [39.952313, -75.162392]
        ],
        'New York Mets': [
            svgs['newYorkMets'],
            'https://en.wikipedia.org/wiki/Citi_Field',
            'Citi Field',
            [40.75535, -73.843219]
        ],
        'Washington Nationals': [
            svgs['washingtonNationals'],
            'https://en.wikipedia.org/wiki/Nationals_Park',
            'Nationals Park',
            [38.872596, -77.007658]
        ],
        'Miami Marlins': [
            svgs['miamiMarlins'],
            'https://en.wikipedia.org/wiki/LoanDepot_Park',
            'loanDepot park',
            [25.954428, -80.238164]
        ]
    };

    static fieldBackground = svgs['fieldBackground'];

    static markerIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=';

    static baseURL = 'https://statsapi.mlb.com/api/v1';
}

export { Consts };
