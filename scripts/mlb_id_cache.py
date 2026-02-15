#!/usr/bin/env python3
"""MLB Player ID Cache - Maps player names to MLB IDs for headshot images"""

import json
import os
import urllib.request

try:
    import statsapi
except ImportError:
    statsapi = None

DATA_DIR = os.environ.get("DATA_DIR", "/app/data")
CACHE_FILE = os.path.join(DATA_DIR, "mlb-id-cache.json")

_cache = None


def _load_cache():
    """Load cache from disk"""
    global _cache
    if _cache is not None:
        return
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, "r") as f:
                _cache = json.load(f)
        else:
            _cache = {}
    except Exception as e:
        print("Warning: could not load MLB ID cache: " + str(e))
        _cache = {}


def _save_cache():
    """Persist cache to disk"""
    global _cache
    if _cache is None:
        return
    try:
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w") as f:
            json.dump(_cache, f)
    except Exception as e:
        print("Warning: could not save MLB ID cache: " + str(e))


def populate_cache():
    """Fetch all active MLB players and build the name->id cache"""
    global _cache
    _load_cache()

    from datetime import date
    year = str(date.today().year)

    url = "https://statsapi.mlb.com/api/v1/sports/1/players?season=" + year
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())

        for player in data.get("people", []):
            name = player.get("fullName", "")
            pid = player.get("id")
            if name and pid:
                _cache[name.lower()] = pid

        _save_cache()
    except Exception as e:
        print("Warning: could not populate MLB ID cache: " + str(e))


def get_mlb_id(name):
    """Look up MLB ID for a player name. Returns int or None."""
    if not name:
        return None

    global _cache
    _load_cache()

    # Auto-populate on first real lookup if cache is empty
    if not _cache:
        populate_cache()

    # Direct lookup
    key = name.lower().strip()
    result = _cache.get(key)
    if result:
        return result

    # Fallback: statsapi.lookup_player
    if statsapi:
        try:
            matches = statsapi.lookup_player(name)
            if matches:
                pid = matches[0].get("id")
                if pid:
                    _cache[key] = pid
                    _save_cache()
                    return pid
        except Exception:
            pass

    return None


def resolve_mlb_ids(names):
    """Batch resolve a list of names to MLB IDs. Returns dict name->id."""
    global _cache
    _load_cache()

    if not _cache:
        populate_cache()

    result = {}
    for name in names:
        if not name:
            continue
        mid = get_mlb_id(name)
        if mid:
            result[name] = mid
    return result
