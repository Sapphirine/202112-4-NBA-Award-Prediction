from bs4 import BeautifulSoup
import requests
from requests.exceptions import RequestException
import collections
import pandas as pd
import uuid
import unicodedata


def get_one_page(url, headers=None):
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.text
        return None
    except RequestException:
        return None


def strip_accents(text):
    return ''.join(char for char in
                   unicodedata.normalize('NFKD', text)
                   if unicodedata.category(char) != 'Mn')


if __name__ == "__main__":
    url = 'https://www.basketball-reference.com/leagues/NBA_2020_totals.html'
    candidates = ["Giannis Antetokounmpo", "LeBron James", "James Harden", "Luka Doncic",
                  "Kawhi Leonard", "Anthony Davis", "Chris Paul", "Damian Lillard", "Nikola Jokic",
                  "Pascal Siakam", "Jimmy Butler", "Jayson Tatum"]
    html = get_one_page(url)
    soup = BeautifulSoup(html, features='html.parser')

    stats = list()
    name_package = set()

    tbody = soup.find_all("tbody")
    trs = tbody[0].find_all("tr")

    for tr in trs:
        th = tr.find_all("th")
        if th[0].get("csk"):
            exist = False
            num = th[0]["csk"]
            td = tr.find_all("td")
            personal_stat = collections.defaultdict(int)
            for t in td:
                if t.get("csk"):
                    names = t["csk"].split(",")
                    name = names[1] + " " + names[0]
                    name = strip_accents(name)
                    if name not in name_package:
                        personal_stat["id"] = str(uuid.uuid4())
                        name_package.add(name)
                        personal_stat["name"] = name
                        personal_stat["label"] = 1 if name in candidates else 0
                    else:
                        exist = True
                else:
                    if exist:
                        if stats[-1]["name"] == name:
                            if t["data-stat"] in ("pts", "trb", "ast", "blk", "stl", "tov", "g"):
                                personal_stat[t["data-stat"]] += int(t.text)
                    else:
                        if t["data-stat"] in ("pts", "trb", "ast", "blk", "stl", "tov", "g"):
                            personal_stat[t["data-stat"]] = int(t.text)
            if exist is False:
                stats.append(personal_stat)

        else:
            continue

    df = pd.DataFrame.from_records(stats, columns=list(personal_stat.keys()))
    df.rename(columns={"trb": "reb"}, inplace=True)
    df.pts = df.pts / df.g
    df.reb = df.reb / df.g
    df.ast = df.ast / df.g
    df.blk = df.blk / df.g
    df.stl = df.stl / df.g
    df.tov = df.tov / df.g
    df = df.drop(columns="g")
    df.to_csv("player_stats_2019_2020.csv", index=False, encoding='utf_8_sig')
