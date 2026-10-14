import asyncio
import aiohttp
import pandas as pd
import sys
import json
from tqdm import tqdm

# Fetch a single game asynchronously


async def fetch_game(session, game_pk, hydrations=""):
    url = f"https://statsapi.mlb.com/api/v1.1/game/{game_pk}/feed/live?hydration={hydrations}"
    try:
        async with session.get(url) as response:
            if response.status == 200:
                return await response.json()
    except Exception as e:
        print(f"Error fetching game {game_pk}: {e}")
    return None


async def fetch_game_pks(start, end):
    url = f'https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate={start}&endDate={end}&hydrate=game(tickets),broadcasts,seriesStatus'

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()

                    # Extract gamePKs from schedule response
                    game_pks = []
                    for date_entry in data.get("dates", []):
                        for game in date_entry.get("games", []):
                            game_pks.append(game.get("gamePk"))
                    return game_pks
        except Exception as e:
            print(f"Error fetching schedule: {e}")
            return []

# Worker pool setup (10 concurrent requests, leap-frogging through the list)


async def fetch_games_worker_pool(game_pks, concurrency_limit=10):
    queue = asyncio.Queue()
    for pk in game_pks:
        queue.put_nowait(pk)

    results = {}

    with tqdm(total=len(game_pks), desc="Fetching Games", unit="game") as pbar:
        async def worker(session):
            while not queue.empty():
                game_pk = await queue.get()
                data = await fetch_game(session, game_pk)
                if data:
                    results[game_pk] = parse_game_features(
                        data, save=(pbar.n == 0))
                queue.task_done()
                pbar.update(1)

        async with aiohttp.ClientSession() as session:
            tasks = [asyncio.create_task(worker(session))
                     for _ in range(concurrency_limit)]
            await asyncio.gather(*tasks)

    return results


def get_stat(stats_dict, group, metric, default=0):
    return stats_dict.get(group, {}).get(metric, default)


def parse_game_features(game_json, save=False):
    """ Extract raw stats needed for your Delta X features """
    live_data = game_json.get("liveData", {})
    if save:
        print('SAVING')
        with open('game.json', 'w') as f:
            f.write(json.dumps(game_json))
    boxscore = live_data.get("boxscore", {})
    teams = boxscore.get("teams", {})

    home_stats = teams.get("home", {}).get("teamStats", {})
    away_stats = teams.get("away", {}).get("teamStats", {})

    # Example raw target & feature values
    home_runs = home_stats.get("batting", {}).get("runs", {})
    away_runs = away_stats.get("batting", {}).get("runs", {})

    return {
        "home_fly_outs": int(get_stat(home_stats, "batting", "flyOuts")),
        "home_ground_outs": int(get_stat(home_stats, "batting", "groundOuts")),
        "home_doubles": int(get_stat(home_stats, "batting", "doubles")),
        "home_triples": int(get_stat(home_stats, "batting", "triples")),
        # Away stats
        "away_fly_outs": int(get_stat(away_stats, "batting", "flyOuts")),
        # Target
        "home_win": 1 if home_runs > away_runs else 0,
    }


if __name__ == '__main__':
    game_pks = asyncio.run(fetch_game_pks('2026-03-01', '2026-09-28'))
    # sys.exit(0)
    # game_pks = game_pks[:20]
    parsed_dict = asyncio.run(fetch_games_worker_pool(game_pks))

    # Convert to DataFrame, compute Delta X, and export
    df = pd.DataFrame.from_dict(parsed_dict, orient='index')

    df.to_csv("baseball_ml_dataset.csv", index_label="game_pk")
    print("Saved dataset to baseball_ml_dataset.csv!")
