#!/usr/bin/env python3
"""MLB Stats API helper for OpenClaw"""

import sys
import json
import urllib.request

MLB_API = "https://statsapi.mlb.com/api/v1"

def fetch(endpoint):
    """Fetch from MLB API"""
    url = MLB_API + endpoint
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())

def cmd_teams(args, as_json=False):
    """List all MLB teams"""
    data = fetch("/teams?sportId=1")
    teams = sorted(data["teams"], key=lambda t: t["name"])
    if as_json:
        return {"teams": [{"abbreviation": t.get("abbreviation", ""), "name": t.get("name", ""), "id": t.get("id", "")} for t in teams]}
    print("MLB Teams:")
    for team in teams:
        print("  " + team["abbreviation"].ljust(4) + " " + team["name"])

def cmd_roster(args, as_json=False):
    """Get team roster (team_id or abbreviation)"""
    if not args:
        if as_json:
            return {"error": "Missing team argument"}
        print("Usage: roster <team_id or abbreviation>")
        return

    team_arg = args[0].upper()

    # Find team by abbreviation or ID
    teams_data = fetch("/teams?sportId=1")
    team_id = None
    team_name = None

    for team in teams_data["teams"]:
        if team["abbreviation"] == team_arg or str(team["id"]) == args[0]:
            team_id = team["id"]
            team_name = team["name"]
            break

    if not team_id:
        if as_json:
            return {"error": "Team not found: " + args[0]}
        print("Team not found: " + args[0])
        return

    data = fetch("/teams/" + str(team_id) + "/roster")

    if as_json:
        roster = []
        for player in data.get("roster", []):
            p = player.get("person", {})
            roster.append({
                "name": p.get("fullName", "?"),
                "position": player.get("position", {}).get("abbreviation", "?"),
                "jersey_number": player.get("jerseyNumber", "?"),
                "player_id": p.get("id", ""),
            })
        return {"team_name": team_name, "roster": roster}

    print(team_name + " Roster:")

    for player in data.get("roster", []):
        p = player.get("person", {})
        name = p.get("fullName", "?")
        pos = player.get("position", {}).get("abbreviation", "?")
        jersey = player.get("jerseyNumber", "?")
        print("  #" + str(jersey).rjust(2) + " " + name.ljust(25) + " " + pos)

def cmd_player(args, as_json=False):
    """Get player info by ID"""
    if not args:
        if as_json:
            return {"error": "Missing player_id argument"}
        print("Usage: player <player_id>")
        return

    player_id = args[0]
    data = fetch("/people/" + player_id)

    people = data.get("people", [])
    if as_json:
        if not people:
            return {"error": "Player not found"}
        p = people[0]
        return {
            "name": p.get("fullName", "?"),
            "position": p.get("primaryPosition", {}).get("name", "?"),
            "team": p.get("currentTeam", {}).get("name", "?"),
            "bats": p.get("batSide", {}).get("code", "?"),
            "throws": p.get("pitchHand", {}).get("code", "?"),
            "age": p.get("currentAge", "?"),
            "mlb_id": p.get("id", "?"),
        }

    for p in people:
        print("Player: " + p.get("fullName", "?"))
        print("  Position: " + p.get("primaryPosition", {}).get("name", "?"))
        print("  Team: " + p.get("currentTeam", {}).get("name", "?"))
        print("  Bats/Throws: " + p.get("batSide", {}).get("code", "?") + "/" + p.get("pitchHand", {}).get("code", "?"))
        print("  Age: " + str(p.get("currentAge", "?")))
        print("  MLB ID: " + str(p.get("id", "?")))

def cmd_stats(args, as_json=False):
    """Get player stats by ID"""
    if not args:
        if as_json:
            return {"error": "Missing player_id argument"}
        print("Usage: stats <player_id> [season]")
        return

    player_id = args[0]
    season = args[1] if len(args) > 1 else "2025"

    data = fetch("/people/" + player_id + "/stats?stats=season&season=" + season)

    if not data.get("stats"):
        if as_json:
            return {"season": season, "stats": {}}
        print("No stats found")
        return

    if as_json:
        stats_dict = {}
        for stat_group in data["stats"]:
            splits = stat_group.get("splits", [])
            if splits:
                stats_dict = splits[0].get("stat", {})
                break
        return {"season": season, "stats": stats_dict}

    for stat_group in data["stats"]:
        splits = stat_group.get("splits", [])
        if splits:
            s = splits[0].get("stat", {})
            print("Stats for " + season + ":")
            for key, val in s.items():
                print("  " + key + ": " + str(val))

def cmd_injuries(args, as_json=False):
    """Get current injuries"""
    data = fetch("/injuries")
    injuries = data.get("injuries", [])

    if as_json:
        result = []
        for inj in injuries:
            result.append({
                "player": inj.get("player", {}).get("fullName", "?"),
                "team": inj.get("team", {}).get("name", "?"),
                "team_id": inj.get("team", {}).get("id", 0),
                "description": inj.get("description", "?"),
            })
        return {"injuries": result}

    if not injuries:
        print("No injuries reported (may be offseason)")
        return

    print("Current Injuries:")
    for inj in injuries:
        player = inj.get("player", {}).get("fullName", "?")
        team = inj.get("team", {}).get("name", "?")
        desc = inj.get("description", "?")
        print("  " + player + " (" + team + "): " + desc)

def cmd_standings(args, as_json=False):
    """Get current standings"""
    data = fetch("/standings?leagueId=103,104")

    if as_json:
        divisions = []
        for record in data.get("records", []):
            div_name = record.get("division", {}).get("name", "Division")
            teams = []
            for team in record.get("teamRecords", []):
                teams.append({
                    "name": team.get("team", {}).get("name", "?"),
                    "team_id": team.get("team", {}).get("id", 0),
                    "wins": team.get("wins", 0),
                    "losses": team.get("losses", 0),
                    "games_back": str(team.get("gamesBack", "-")),
                })
            divisions.append({"name": div_name, "teams": teams})
        return {"divisions": divisions}

    for record in data.get("records", []):
        div = record.get("division", {}).get("name", "Division")
        print("\n" + div + ":")
        for team in record.get("teamRecords", []):
            name = team.get("team", {}).get("name", "?")
            wins = team.get("wins", 0)
            losses = team.get("losses", 0)
            gb = team.get("gamesBack", "-")
            print("  " + name.ljust(25) + " " + str(wins) + "-" + str(losses) + " (" + str(gb) + " GB)")

def cmd_schedule(args, as_json=False):
    """Get today schedule or specific date"""
    date = args[0] if args else ""
    endpoint = "/schedule?sportId=1"
    if date:
        endpoint += "&date=" + date

    data = fetch(endpoint)

    if as_json:
        all_games = []
        date_label = ""
        for date_data in data.get("dates", []):
            date_label = date_data.get("date", "?")
            for game in date_data.get("games", []):
                all_games.append({
                    "away": game.get("teams", {}).get("away", {}).get("team", {}).get("name", "?"),
                    "away_id": game.get("teams", {}).get("away", {}).get("team", {}).get("id", 0),
                    "home": game.get("teams", {}).get("home", {}).get("team", {}).get("name", "?"),
                    "home_id": game.get("teams", {}).get("home", {}).get("team", {}).get("id", 0),
                    "status": game.get("status", {}).get("detailedState", "?"),
                })
        return {"date": date_label, "games": all_games}

    for date_data in data.get("dates", []):
        print("Games for " + date_data.get("date", "?") + ":")
        for game in date_data.get("games", []):
            away = game.get("teams", {}).get("away", {}).get("team", {}).get("name", "?")
            home = game.get("teams", {}).get("home", {}).get("team", {}).get("name", "?")
            status = game.get("status", {}).get("detailedState", "?")
            print("  " + away + " @ " + home + " - " + status)

COMMANDS = {
    "teams": cmd_teams,
    "roster": cmd_roster,
    "player": cmd_player,
    "stats": cmd_stats,
    "injuries": cmd_injuries,
    "standings": cmd_standings,
    "schedule": cmd_schedule,
}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("MLB Stats API CLI")
        print("Usage: mlb-data.py <command> [args]")
        print("\nCommands:")
        print("  teams      - List all MLB teams")
        print("  roster     - Get team roster (team abbr or id)")
        print("  player     - Get player info by ID")
        print("  stats      - Get player stats")
        print("  injuries   - Current injuries")
        print("  standings  - Division standings")
        print("  schedule   - Todays games (or date)")
        sys.exit(1)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    if cmd not in COMMANDS:
        print("Unknown command: " + cmd)
        sys.exit(1)

    COMMANDS[cmd](args)
