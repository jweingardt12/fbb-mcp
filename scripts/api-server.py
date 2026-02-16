#!/usr/bin/env python3
"""Yahoo Fantasy Baseball JSON API Server

Routes match the TypeScript MCP Apps server's python-client.ts expectations.
"""

import sys
import os
import importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request

# Import modules (some have hyphens, need importlib)
yahoo_fantasy = importlib.import_module("yahoo-fantasy")
draft_assistant = importlib.import_module("draft-assistant")
mlb_data = importlib.import_module("mlb-data")
season_manager = importlib.import_module("season-manager")
import valuations
import history
import intel
import yahoo_browser

app = Flask(__name__)


# --- Session heartbeat (keeps Yahoo cookies alive) ---

HEARTBEAT_INTERVAL = int(os.environ.get("BROWSER_HEARTBEAT_HOURS", "6")) * 3600


def _run_heartbeat():
    """Background loop that refreshes the browser session periodically"""
    import time
    # Wait a bit for startup to settle
    time.sleep(30)
    while True:
        try:
            status = yahoo_browser.is_session_valid()
            if status.get("valid"):
                yahoo_browser.refresh_session()
        except Exception as e:
            print("Heartbeat error: " + str(e))
        time.sleep(HEARTBEAT_INTERVAL)


import threading
_heartbeat_thread = threading.Thread(target=_run_heartbeat, daemon=True)
_heartbeat_thread.start()


# --- Health check ---

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/browser-login-status")
def api_browser_login_status():
    try:
        result = yahoo_browser.is_session_valid()
        result["heartbeat"] = yahoo_browser.get_heartbeat_state()
        return jsonify(result)
    except Exception as e:
        return jsonify({"valid": False, "reason": str(e)}), 500


@app.route("/api/change-team-name", methods=["POST"])
def api_change_team_name():
    try:
        data = request.get_json(force=True) if request.is_json else request.form
        new_name = data.get("new_name", "")
        if not new_name:
            return jsonify({"error": "Missing new_name"}), 400
        result = yahoo_browser.change_team_name(new_name)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/change-team-logo", methods=["POST"])
def api_change_team_logo():
    try:
        data = request.get_json(force=True) if request.is_json else request.form
        image_path = data.get("image_path", "")
        if not image_path:
            return jsonify({"error": "Missing image_path"}), 400
        result = yahoo_browser.change_team_logo(image_path)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Yahoo Fantasy (yahoo-fantasy.py) ---
# TS tools call: /api/roster, /api/free-agents, /api/standings, etc.

@app.route("/api/roster")
def api_roster():
    try:
        result = yahoo_fantasy.cmd_roster([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/free-agents")
def api_free_agents():
    try:
        pos_type = request.args.get("pos_type", "B")
        count = request.args.get("count", "20")
        result = yahoo_fantasy.cmd_free_agents([pos_type, count], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/standings")
def api_standings():
    try:
        result = yahoo_fantasy.cmd_standings([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/info")
def api_info():
    try:
        result = yahoo_fantasy.cmd_info([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/search")
def api_search():
    try:
        # TS tool sends "name" param
        name = request.args.get("name", "")
        if not name:
            return jsonify({"error": "Missing name parameter"}), 400
        result = yahoo_fantasy.cmd_search([name], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/add", methods=["POST"])
def api_add():
    try:
        # TS tool sends JSON body: { player_id: "..." }
        data = request.get_json(silent=True) or {}
        player_id = data.get("player_id", "")
        if not player_id:
            player_id = request.args.get("player_id", "")
        if not player_id:
            return jsonify({"error": "Missing player_id"}), 400
        result = yahoo_fantasy.cmd_add([player_id], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/drop", methods=["POST"])
def api_drop():
    try:
        data = request.get_json(silent=True) or {}
        player_id = data.get("player_id", "")
        if not player_id:
            player_id = request.args.get("player_id", "")
        if not player_id:
            return jsonify({"error": "Missing player_id"}), 400
        result = yahoo_fantasy.cmd_drop([player_id], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/swap", methods=["POST"])
def api_swap():
    try:
        data = request.get_json(silent=True) or {}
        add_id = data.get("add_id", "")
        drop_id = data.get("drop_id", "")
        if not add_id:
            add_id = request.args.get("add_id", "")
        if not drop_id:
            drop_id = request.args.get("drop_id", "")
        if not add_id or not drop_id:
            return jsonify({"error": "Missing add_id and/or drop_id"}), 400
        result = yahoo_fantasy.cmd_swap([add_id, drop_id], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/matchups")
def api_matchups():
    try:
        args = []
        week = request.args.get("week", "")
        if week:
            args.append(week)
        result = yahoo_fantasy.cmd_matchups(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/scoreboard")
def api_scoreboard():
    try:
        args = []
        week = request.args.get("week", "")
        if week:
            args.append(week)
        result = yahoo_fantasy.cmd_scoreboard(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/transactions")
def api_transactions():
    try:
        args = []
        tx_type = request.args.get("type", "")
        if tx_type:
            args.append(tx_type)
        count = request.args.get("count", "")
        if count:
            args.append(count)
        result = yahoo_fantasy.cmd_transactions(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/stat-categories")
def api_stat_categories():
    try:
        result = yahoo_fantasy.cmd_stat_categories([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/transaction-trends")
def api_transaction_trends():
    try:
        result = yahoo_fantasy.cmd_transaction_trends([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/matchup-detail")
def api_matchup_detail():
    try:
        result = yahoo_fantasy.cmd_matchup_detail([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Draft Assistant (draft-assistant.py) ---
# TS tools call: /api/draft-status, /api/draft-recommend, /api/draft-cheatsheet, /api/best-available

@app.route("/api/draft-status")
def api_draft_status():
    try:
        da = draft_assistant.DraftAssistant()
        result = da.status(as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/draft-recommend")
def api_draft_recommend():
    try:
        da = draft_assistant.DraftAssistant()
        result = da.recommend(as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/draft-cheatsheet")
def api_draft_cheatsheet():
    try:
        result = draft_assistant.cmd_cheatsheet([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/best-available")
def api_best_available():
    try:
        pos_type = request.args.get("pos_type", "B")
        count = request.args.get("count", "25")
        result = draft_assistant.cmd_best_available([pos_type, count], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Valuations (valuations.py) ---
# TS tools call: /api/rankings, /api/compare, /api/value

@app.route("/api/rankings")
def api_rankings():
    try:
        pos_type = request.args.get("pos_type", "B")
        count = request.args.get("count", "25")
        result = valuations.cmd_rankings([pos_type, count], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/compare")
def api_compare():
    try:
        # TS tool sends player1 and player2 params
        player1 = request.args.get("player1", "")
        player2 = request.args.get("player2", "")
        if not player1 or not player2:
            return jsonify({"error": "Missing player1 and/or player2 parameters"}), 400
        result = valuations.cmd_compare([player1, player2], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/value")
def api_value():
    try:
        # TS tool sends "player_name" param
        name = request.args.get("player_name", "")
        if not name:
            name = request.args.get("name", "")
        if not name:
            return jsonify({"error": "Missing player_name parameter"}), 400
        result = valuations.cmd_value([name], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Season Manager (season-manager.py) ---
# TS tools call: /api/lineup-optimize, /api/category-check, etc.

@app.route("/api/lineup-optimize")
def api_lineup_optimize():
    try:
        args = []
        apply_flag = request.args.get("apply", "false")
        if apply_flag.lower() == "true":
            args.append("--apply")
        result = season_manager.cmd_lineup_optimize(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/category-check")
def api_category_check():
    try:
        result = season_manager.cmd_category_check([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/injury-report")
def api_injury_report():
    try:
        result = season_manager.cmd_injury_report([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/waiver-analyze")
def api_waiver_analyze():
    try:
        pos_type = request.args.get("pos_type", "B")
        count = request.args.get("count", "15")
        result = season_manager.cmd_waiver_analyze([pos_type, count], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/streaming")
def api_streaming():
    try:
        args = []
        week = request.args.get("week", "")
        if week:
            args.append(week)
        result = season_manager.cmd_streaming(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/trade-eval", methods=["POST"])
def api_trade_eval():
    try:
        # TS tool sends JSON body: { give_ids: "...", get_ids: "..." }
        data = request.get_json(silent=True) or {}
        give_ids = data.get("give_ids", "")
        get_ids = data.get("get_ids", "")
        if not give_ids or not get_ids:
            return jsonify({"error": "Missing give_ids and/or get_ids"}), 400
        result = season_manager.cmd_trade_eval([give_ids, get_ids], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/category-simulate")
def api_category_simulate():
    try:
        add_name = request.args.get("add_name", "")
        drop_name = request.args.get("drop_name", "")
        if not add_name:
            return jsonify({"error": "Missing add_name parameter"}), 400
        args = [add_name]
        if drop_name:
            args.append(drop_name)
        result = season_manager.cmd_category_simulate(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/scout-opponent")
def api_scout_opponent():
    try:
        result = season_manager.cmd_scout_opponent([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/matchup-strategy")
def api_matchup_strategy():
    try:
        result = season_manager.cmd_matchup_strategy([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/daily-update")
def api_daily_update():
    try:
        result = season_manager.cmd_daily_update([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/pending-trades")
def api_pending_trades():
    try:
        result = season_manager.cmd_pending_trades([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/propose-trade", methods=["POST"])
def api_propose_trade():
    try:
        data = request.get_json(silent=True) or {}
        their_team_key = data.get("their_team_key", "")
        your_player_ids = data.get("your_player_ids", "")
        their_player_ids = data.get("their_player_ids", "")
        note = data.get("note", "")
        if not their_team_key or not your_player_ids or not their_player_ids:
            return jsonify({"error": "Missing their_team_key, your_player_ids, or their_player_ids"}), 400
        args = [their_team_key, your_player_ids, their_player_ids]
        if note:
            args.append(note)
        result = season_manager.cmd_propose_trade(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/accept-trade", methods=["POST"])
def api_accept_trade():
    try:
        data = request.get_json(silent=True) or {}
        transaction_key = data.get("transaction_key", "")
        note = data.get("note", "")
        if not transaction_key:
            return jsonify({"error": "Missing transaction_key"}), 400
        args = [transaction_key]
        if note:
            args.append(note)
        result = season_manager.cmd_accept_trade(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/reject-trade", methods=["POST"])
def api_reject_trade():
    try:
        data = request.get_json(silent=True) or {}
        transaction_key = data.get("transaction_key", "")
        note = data.get("note", "")
        if not transaction_key:
            return jsonify({"error": "Missing transaction_key"}), 400
        args = [transaction_key]
        if note:
            args.append(note)
        result = season_manager.cmd_reject_trade(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/set-lineup", methods=["POST"])
def api_set_lineup():
    try:
        data = request.get_json(silent=True) or {}
        moves = data.get("moves", [])
        if not moves:
            return jsonify({"error": "Missing moves array"}), 400
        # Convert moves to "player_id:position" arg format
        args = []
        for m in moves:
            pid = m.get("player_id", "")
            pos = m.get("position", "")
            if pid and pos:
                args.append(str(pid) + ":" + str(pos))
        if not args:
            return jsonify({"error": "No valid moves provided"}), 400
        result = season_manager.cmd_set_lineup(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Waiver Claims (yahoo-fantasy.py) ---

@app.route("/api/waiver-claim", methods=["POST"])
def api_waiver_claim():
    try:
        data = request.get_json(silent=True) or {}
        player_id = data.get("player_id", "")
        if not player_id:
            return jsonify({"error": "Missing player_id"}), 400
        args = [player_id]
        faab = data.get("faab")
        if faab is not None:
            args.append(str(faab))
        result = yahoo_fantasy.cmd_waiver_claim(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/waiver-claim-swap", methods=["POST"])
def api_waiver_claim_swap():
    try:
        data = request.get_json(silent=True) or {}
        add_id = data.get("add_id", "")
        drop_id = data.get("drop_id", "")
        if not add_id or not drop_id:
            return jsonify({"error": "Missing add_id and/or drop_id"}), 400
        args = [add_id, drop_id]
        faab = data.get("faab")
        if faab is not None:
            args.append(str(faab))
        result = yahoo_fantasy.cmd_waiver_claim_swap(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Who Owns / League Pulse (yahoo-fantasy.py) ---

@app.route("/api/who-owns")
def api_who_owns():
    try:
        player_id = request.args.get("player_id", "")
        if not player_id:
            return jsonify({"error": "Missing player_id parameter"}), 400
        result = yahoo_fantasy.cmd_who_owns([player_id], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/league-pulse")
def api_league_pulse():
    try:
        result = yahoo_fantasy.cmd_league_pulse([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Phase 3: What's New & Trade Finder ---

@app.route("/api/whats-new")
def api_whats_new():
    try:
        result = season_manager.cmd_whats_new([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/trade-finder")
def api_trade_finder():
    try:
        result = season_manager.cmd_trade_finder([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Phase 4: Power Rankings, Week Planner, Season Pace ---

@app.route("/api/power-rankings")
def api_power_rankings():
    try:
        result = season_manager.cmd_power_rankings([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/week-planner")
def api_week_planner():
    try:
        args = []
        week = request.args.get("week", "")
        if week:
            args.append(week)
        result = season_manager.cmd_week_planner(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/season-pace")
def api_season_pace():
    try:
        result = season_manager.cmd_season_pace([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Phase 5: Closer Monitor ---

@app.route("/api/closer-monitor")
def api_closer_monitor():
    try:
        result = season_manager.cmd_closer_monitor([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Phase 5: Pitcher Matchup ---

@app.route("/api/pitcher-matchup")
def api_pitcher_matchup():
    try:
        week = request.args.get("week", "")
        args = [week] if week else []
        result = season_manager.cmd_pitcher_matchup(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- MLB Data (mlb-data.py) ---
# TS tools call: /api/mlb/teams, /api/mlb/roster, etc. (these already match)

@app.route("/api/mlb/teams")
def api_mlb_teams():
    try:
        result = mlb_data.cmd_teams([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mlb/roster")
def api_mlb_roster():
    try:
        team = request.args.get("team", "")
        if not team:
            return jsonify({"error": "Missing team parameter"}), 400
        result = mlb_data.cmd_roster([team], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mlb/player")
def api_mlb_player():
    try:
        player_id = request.args.get("player_id", "")
        if not player_id:
            return jsonify({"error": "Missing player_id parameter"}), 400
        result = mlb_data.cmd_player([player_id], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mlb/stats")
def api_mlb_stats():
    try:
        player_id = request.args.get("player_id", "")
        if not player_id:
            return jsonify({"error": "Missing player_id parameter"}), 400
        args = [player_id]
        season = request.args.get("season", "")
        if season:
            args.append(season)
        result = mlb_data.cmd_stats(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mlb/injuries")
def api_mlb_injuries():
    try:
        result = mlb_data.cmd_injuries([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mlb/standings")
def api_mlb_standings():
    try:
        result = mlb_data.cmd_standings([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/mlb/schedule")
def api_mlb_schedule():
    try:
        args = []
        date_arg = request.args.get("date", "")
        if date_arg:
            args.append(date_arg)
        result = mlb_data.cmd_schedule(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- History (history.py) ---
# TS tools call: /api/league-history, /api/record-book, /api/past-standings, etc.

@app.route("/api/league-history")
def api_league_history():
    try:
        result = history.cmd_league_history([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/record-book")
def api_record_book():
    try:
        result = history.cmd_record_book([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/past-standings")
def api_past_standings():
    try:
        year = request.args.get("year", "")
        if not year:
            return jsonify({"error": "Missing year parameter"}), 400
        result = history.cmd_past_standings([year], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/past-draft")
def api_past_draft():
    try:
        year = request.args.get("year", "")
        if not year:
            return jsonify({"error": "Missing year parameter"}), 400
        args = [year]
        count = request.args.get("count", "")
        if count:
            args.append(count)
        result = history.cmd_past_draft(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/past-teams")
def api_past_teams():
    try:
        year = request.args.get("year", "")
        if not year:
            return jsonify({"error": "Missing year parameter"}), 400
        result = history.cmd_past_teams([year], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/past-trades")
def api_past_trades():
    try:
        year = request.args.get("year", "")
        if not year:
            return jsonify({"error": "Missing year parameter"}), 400
        args = [year]
        count = request.args.get("count", "")
        if count:
            args.append(count)
        result = history.cmd_past_trades(args, as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/past-matchup")
def api_past_matchup():
    try:
        year = request.args.get("year", "")
        week = request.args.get("week", "")
        if not year or not week:
            return jsonify({"error": "Missing year and/or week parameters"}), 400
        result = history.cmd_past_matchup([year, week], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- Intel (intel.py) ---

@app.route("/api/intel/player")
def api_intel_player():
    try:
        name = request.args.get("name", "")
        if not name:
            return jsonify({"error": "Missing name parameter"}), 400
        result = intel.cmd_player_report([name], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/intel/breakouts")
def api_intel_breakouts():
    try:
        pos_type = request.args.get("pos_type", "B")
        count = request.args.get("count", "15")
        result = intel.cmd_breakouts([pos_type, count], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/intel/busts")
def api_intel_busts():
    try:
        pos_type = request.args.get("pos_type", "B")
        count = request.args.get("count", "15")
        result = intel.cmd_busts([pos_type, count], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/intel/reddit")
def api_intel_reddit():
    try:
        result = intel.cmd_reddit_buzz([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/intel/trending")
def api_intel_trending():
    try:
        result = intel.cmd_trending([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/intel/prospects")
def api_intel_prospects():
    try:
        result = intel.cmd_prospect_watch([], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/intel/transactions")
def api_intel_transactions():
    try:
        days = request.args.get("days", "7")
        result = intel.cmd_transactions([days], as_json=True)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/intel/batch")
def api_intel_batch():
    try:
        names = request.args.get("names", "")
        if not names:
            return jsonify({"error": "Missing names parameter (comma-separated)"}), 400
        name_list = [n.strip() for n in names.split(",") if n.strip()]
        include_str = request.args.get("include", "statcast")
        include = [s.strip() for s in include_str.split(",") if s.strip()]
        result = intel.batch_intel(name_list, include=include)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("API_PORT", "8766"))
    app.run(host="127.0.0.1", port=port)
