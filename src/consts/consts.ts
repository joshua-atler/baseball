// @ts-nocheck

import * as svgsConst from './svg/*.js';
const svgsConst = import.meta.glob('./svg/*.js', { eager: true });

let svgs = JSON.parse(JSON.stringify(svgsConst));

svgs = Object.assign({}, ...Object.values(svgs));

Object.keys(svgs).forEach(key => {
    svgs[key] = 'data:image/svg+xml;base64,' + btoa(svgs[key])
});

const createTeam = (logoCode) => ({
    logo: `/teamLogos/${logoCode}.svg`
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
            ['TEX', 'HOU', 'LAA', 'SEA', 'ATH']
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
        'Texas Rangers': createTeam('TEX'),
        'Houston Astros': createTeam('HOU'),
        'Los Angeles Angels': createTeam('LAA'),
        'Seattle Mariners': createTeam('SEA'),
        'Oakland Athletics': createTeam('ATH'),
        'Athletics': createTeam('ATH'),
        'Cleveland Guardians': createTeam('CLE'),
        'Kansas City Royals': createTeam('KC'),
        'Detroit Tigers': createTeam('DET'),
        'Minnesota Twins': createTeam('MIN'),
        'Chicago White Sox': createTeam('CWS'),
        'New York Yankees': createTeam('NYY'),
        'Baltimore Orioles': createTeam('BAL'),
        'Boston Red Sox': createTeam('BOS'),
        'Tampa Bay Rays': createTeam('TB'),
        'Toronto Blue Jays': createTeam('TOR'),
        'Los Angeles Dodgers': createTeam('LAD'),
        'San Diego Padres': createTeam('SD'),
        'San Francisco Giants': createTeam('SF'),
        'Arizona Diamondbacks': createTeam('AZ'),
        'Colorado Rockies': createTeam('COL'),
        'Milwaukee Brewers': createTeam('MIL'),
        'Chicago Cubs': createTeam('CHC'),
        'Cincinnati Reds': createTeam('CIN'),
        'St. Louis Cardinals': createTeam('STL'),
        'Pittsburgh Pirates': createTeam('PIT'),
        'Atlanta Braves': createTeam('ATL'),
        'Philadelphia Phillies': createTeam('PHI'),
        'New York Mets': createTeam('NYM'),
        'Washington Nationals': createTeam('WSH'),
        'Miami Marlins': createTeam('MIA')
    };

    static teamInfo = {
        "NYY": {
            "name": "New York Yankees",
            "nickname": "yankees",
            "primary": "rgb(19, 36, 72)",
            "secondary": "rgb(255, 255, 255)"
        },
        "BAL": {
            "name": "Baltimore Orioles",
            "nickname": "orioles",
            "primary": "rgb(223, 70, 1)",
            "secondary": "rgb(0, 0, 0)"
        },
        "BOS": {
            "name": "Boston Red Sox",
            "nickname": "redsox",
            "primary": "rgb(189, 48, 57)",
            "secondary": "rgb(12, 35, 64)"
        },
        "TB": {
            "name": "Tampa Bay Rays",
            "nickname": "rays",
            "primary": "rgb(9, 44, 92)",
            "secondary": "rgb(245, 209, 48)"
        },
        "TOR": {
            "name": "Toronto Blue Jays",
            "nickname": "bluejays",
            "primary": "rgb(19, 74, 142)",
            "secondary": "rgb(232, 41, 28)"
        },
        "CLE": {
            "name": "Cleveland Guardians",
            "nickname": "guardians",
            "primary": "rgb(12, 35, 63)",
            "secondary": "rgb(229, 0, 34)"
        },
        "KC": {
            "name": "Kansas City Royals",
            "nickname": "royals",
            "primary": "rgb(0, 70, 135)",
            "secondary": "rgb(189, 155, 96)"
        },
        "DET": {
            "name": "Detroit Tigers",
            "nickname": "tigers",
            "primary": "rgb(12, 35, 64)",
            "secondary": "rgb(250, 70, 22)"
        },
        "MIN": {
            "name": "Minnesota Twins",
            "nickname": "twins",
            "primary": "rgb(211, 17, 69)",
            "secondary": "rgb(0, 43, 92)"
        },
        "CWS": {
            "name": "Chicago White Sox",
            "nickname": "whitesox",
            "primary": "rgb(0, 0, 0)",
            "secondary": "rgb(196, 206, 212)"
        },
        "TEX": {
            "name": "Texas Rangers",
            "nickname": "rangers",
            "primary": "rgb(0, 50, 120)",
            "secondary": "rgb(192, 17, 31)"
        },
        "HOU": {
            "name": "Houston Astros",
            "nickname": "astros",
            "primary": "rgb(235, 110, 31)",
            "secondary": "rgb(0, 45, 98)"
        },
        "LAA": {
            "name": "Los Angeles Angels",
            "nickname": "angels",
            "primary": "rgb(186, 0, 33)",
            "secondary": "rgb(196, 206, 212)"
        },
        "SEA": {
            "name": "Seattle Mariners",
            "nickname": "mariners",
            "primary": "rgb(0, 92, 92)",
            "secondary": "rgb(12, 44, 86)"
        },
        "ATH": {
            "name": "Oakland Athletics",
            "nickname": "athletics",
            "primary": "rgb(0, 56, 49)",
            "secondary": "rgb(239, 178, 30)"
        },
        "ATL": {
            "name": "Atlanta Braves",
            "nickname": "braves",
            "primary": "rgb(206, 17, 65)",
            "secondary": "rgb(19, 39, 79)"
        },
        "PHI": {
            "name": "Philadelphia Phillies",
            "nickname": "phillies",
            "primary": "rgb(232, 24, 40)",
            "secondary": "rgb(107, 172, 228)"
        },
        "NYM": {
            "name": "New York Mets",
            "nickname": "mets",
            "primary": "rgb(0, 45, 114)",
            "secondary": "rgb(252, 89, 16)"
        },
        "WSH": {
            "name": "Washington Nationals",
            "nickname": "nationals",
            "primary": "rgb(171, 0, 3)",
            "secondary": "rgb(20, 34, 90)"
        },
        "MIA": {
            "name": "Miami Marlins",
            "nickname": "marlins",
            "primary": "rgb(0, 163, 224)",
            "secondary": "rgb(239, 51, 64)"
        },
        "MIL": {
            "name": "Milwaukee Brewers",
            "nickname": "brewers",
            "primary": "rgb(255, 197, 47)",
            "secondary": "rgb(18, 40, 75)"
        },
        "CHC": {
            "name": "Chicago Cubs",
            "nickname": "cubs",
            "primary": "rgb(14, 51, 134)",
            "secondary": "rgb(204, 52, 51)"
        },
        "CIN": {
            "name": "Cincinnati Reds",
            "nickname": "reds",
            "primary": "rgb(198, 1, 31)",
            "secondary": "rgb(0, 0, 0)"
        },
        "STL": {
            "name": "St. Louis Cardinals",
            "nickname": "cardinals",
            "primary": "rgb(196, 30, 58)",
            "secondary": "rgb(254, 219, 0)"
        },
        "PIT": {
            "name": "Pittsburgh Pirates",
            "nickname": "pirates",
            "primary": "rgb(253, 184, 39)",
            "secondary": "rgb(0, 0, 0)"
        },
        "LAD": {
            "name": "Los Angeles Dodgers",
            "nickname": "dodgers",
            "primary": "rgb(0, 90, 156)",
            "secondary": "rgb(255, 255, 255)"
        },
        "SD": {
            "name": "San Diego Padres",
            "nickname": "padres",
            "primary": "rgb(47, 36, 29)",
            "secondary": "rgb(255, 196, 37)"
        },
        "SF": {
            "name": "San Francisco Giants",
            "nickname": "giants",
            "primary": "rgb(253, 90, 30)",
            "secondary": "rgb(0, 0, 0)"
        },
        "AZ": {
            "name": "Arizona Diamondbacks",
            "nickname": "dbacks",
            "primary": "rgb(167, 25, 48)",
            "secondary": "rgb(227, 212, 173)"
        },
        "COL": {
            "name": "Colorado Rockies",
            "nickname": "rockies",
            "primary": "rgb(51, 0, 102)",
            "secondary": "rgb(196, 206, 212)"
        }
    };

    static fieldBackground = svgs['fieldBackground'];

    static markerIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=';

    static baseURL = 'https://statsapi.mlb.com/api/v1';

    static timeZoneOffset = {
        'PT': -3,
        'MT': -2,
        'CT': -1,
        'ET': 0
    };

    static pitchIcons = {
        'steals': '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="m242-200 200-280-200-280h98l200 280-200 280h-98Zm238 0 200-280-200-280h98l200 280-200 280h-98Z"/></svg>',
        'error': '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M479.79-288q15.21 0 25.71-10.29t10.5-25.5q0-15.21-10.29-25.71t-25.5-10.5q-15.21 0-25.71 10.29t-10.5 25.5q0 15.21 10.29 25.71t25.5 10.5ZM444-432h72v-240h-72v240Zm36.28 336Q401-96 331-126t-122.5-82.5Q156-261 126-330.96t-30-149.5Q96-560 126-629.5q30-69.5 82.5-122T330.96-834q69.96-30 149.5-30t149.04 30q69.5 30 122 82.5T834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30Zm-.28-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"/></svg>',
        'switch': '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M288-168 96-360l192-192 51 51-105 105h294v72H234l105 105-51 51Zm384-240-51-51 105-105H432v-72h294L621-741l51-51 192 192-192 192Z"/></svg>',
        'pause': '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="m614-310 51-51-149-149v-210h-72v240l170 170ZM480-96q-79.38 0-149.19-30T208.5-208.5Q156-261 126-330.96t-30-149.5Q96-560 126-630q30-70 82.5-122t122.46-82q69.96-30 149.5-30t149.55 30.24q70 30.24 121.79 82.08 51.78 51.84 81.99 121.92Q864-559.68 864-480q0 79.38-30 149.19T752-208.5Q700-156 629.87-126T480-96Zm0-384Zm.48 312q129.47 0 220.5-91.5Q792-351 792-480.48q0-129.47-91.02-220.5Q609.95-792 480.48-792 351-792 259.5-700.98 168-609.95 168-480.48 168-351 259.5-259.5T480.48-168Z"/></svg>',
        'status': '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M336-336h72v-288h-72v288Zm144 0 216-144-216-144v288Zm.28 240Q401-96 331-126t-122.5-82.5Q156-261 126-330.96t-30-149.5Q96-560 126-629.5q30-69.5 82.5-122T330.96-834q69.96-30 149.5-30t149.04 30q69.5 30 122 82.5T834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30Zm-.28-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"/></svg>',
        'caught': '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M480-96q-79 0-149-30t-122.5-82.5Q156-261 126-331T96-480q0-80 30-149.5t82.5-122Q261-804 331-834t149-30q80 0 149.5 30t122 82.5Q804-699 834-629.5T864-480q0 79-30 149t-82.5 122.5Q699-156 629.5-126T480-96Zm0-72q55 0 104-18t89-50L236-673q-32 40-50 89t-18 104q0 130 91 221t221 91Zm244-119q32-40 50-89t18-104q0-130-91-221t-221-91q-55 0-104 18t-89 50l437 437Z"/></svg>',
        'remains': '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M444-288h72v-240h-72v240Zm35.79-312q15.21 0 25.71-10.29t10.5-25.5q0-15.21-10.29-25.71t-25.5-10.5q-15.21 0-25.71 10.29t-10.5 25.5q0 15.21 10.29 25.71t25.5 10.5Zm.49 504Q401-96 331-126t-122.5-82.5Q156-261 126-330.96t-30-149.5Q96-560 126-629.5q30-69.5 82.5-122T330.96-834q69.96-30 149.5-30t149.04 30q69.5 30 122 82.5T834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30Zm-.28-72q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 130 91 221t221 91Zm0-312Z"/></svg>',
        'warning': '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="m48-144 432-720 432 720H48Zm127-72h610L480-724 175-216Zm304.79-48q15.21 0 25.71-10.29t10.5-25.5q0-15.21-10.29-25.71t-25.5-10.5q-15.21 0-25.71 10.29t-10.5 25.5q0 15.21 10.29 25.71t25.5 10.5ZM444-384h72v-192h-72v192Zm36-86Z"/></svg>',
        'timer': '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M360-816v-72h240v72H360Zm84 432h72v-240h-72v240Zm36 288q-70 0-130.92-26.51-60.92-26.5-106.49-72.08-45.58-45.57-72.08-106.49Q144-362 144-432q0-70 26.51-130.92 26.5-60.92 72.08-106.49 45.57-45.58 106.49-72.08Q410-768 479.56-768q58.28 0 111.86 19.5T691-694l52-51 50 50-51 52q35 45 54.5 98.81T816-431.86q0 69.86-26.51 130.78-26.5 60.92-72.08 106.49-45.57 45.58-106.49 72.08Q550-96 480-96Zm0-72q110 0 187-77t77-187q0-110-77-187t-187-77q-110 0-187 77t-77 187q0 110 77 187t187 77Zm0-264Z"/></svg>'
    }

    static findTeamIndex(teamName) {
        if (teamName == 'Athletics') {
            teamName = 'Oakland Athletics';
        }

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
}

export { Consts };

window.Consts = Consts;
