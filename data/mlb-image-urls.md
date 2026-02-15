# MLB Player Headshots & Team Logos - URL Reference

## 1. Player Headshots (img.mlbstatic.com)

Uses Cloudinary CDN. Requires **MLB Stats API player ID** (MLBAM ID).

### URL Pattern
```
https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_{WIDTH},q_auto:best/v1/people/{PLAYER_ID}/headshot/67/current
```

### Example (Mike Trout = 545361)
```
https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/545361/headshot/67/current
```

### Sizes (any integer works, Cloudinary resizes on the fly)
| Width | Dimensions  | File Size | Use Case         |
|-------|-------------|-----------|------------------|
| w_120 | 120 x 180   | ~9 KB     | Thumbnails       |
| w_213 | 213 x 320   | ~22 KB    | Small cards      |
| w_426 | 426 x 640   | ~82 KB    | Medium display   |
| w_640 | 640 x 962   | ~162 KB   | Full size        |

### Transparent Background Variant (PNG silo cutout)
```
https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_{WIDTH},q_auto:best/v1/people/{PLAYER_ID}/headshot/silo/current
```
Returns PNG with transparent background. Good for overlays.

### Fallback Behavior
Invalid player IDs return a generic silhouette placeholder (HTTP 200, ~5 KB).
The `d_people:generic:headshot:67:current.png` parameter in the URL controls this default.

---

## 2. Team Logos (mlbstatic.com)

### SVG Logos (vector, best quality)
```
https://www.mlbstatic.com/team-logos/{TEAM_ID}.svg
```

#### Variants
| Path                                      | Description            | Status |
|-------------------------------------------|------------------------|--------|
| `/team-logos/{ID}.svg`                    | Default logo           | 200 OK |
| `/team-logos/team-cap-on-light/{ID}.svg`  | Cap logo, light bg     | 200 OK |
| `/team-logos/team-cap-on-dark/{ID}.svg`   | Cap logo, dark bg      | 200 OK |
| `/team-logos/team-primary-on-light/{ID}.svg` | Primary logo, light bg | 200 OK |
| `/team-logos/team-primary-on-dark/{ID}.svg`  | Primary logo, dark bg  | 200 OK |

### PNG Logos (midfield CDN, raster)
```
https://midfield.mlbstatic.com/v1/team/{TEAM_ID}/spots/{SIZE}
```

| Size | File Size | Use Case     |
|------|-----------|--------------|
| 48   | ~0.9 KB   | Tiny icons   |
| 72   | ~1.2 KB   | Small icons  |
| 128  | ~2 KB     | Medium icons |
| 256  | ~4.4 KB   | Large icons  |

---

## 3. MLB Team IDs (for logos)

| ID  | Team                    | ID  | Team                    |
|-----|-------------------------|-----|-------------------------|
| 108 | Los Angeles Angels      | 133 | Athletics               |
| 109 | Arizona Diamondbacks    | 134 | Pittsburgh Pirates      |
| 110 | Baltimore Orioles       | 135 | San Diego Padres        |
| 111 | Boston Red Sox          | 136 | Seattle Mariners        |
| 112 | Chicago Cubs            | 137 | San Francisco Giants    |
| 113 | Cincinnati Reds         | 138 | St. Louis Cardinals     |
| 114 | Cleveland Guardians     | 139 | Tampa Bay Rays          |
| 115 | Colorado Rockies        | 140 | Texas Rangers           |
| 116 | Detroit Tigers          | 141 | Toronto Blue Jays       |
| 117 | Houston Astros          | 142 | Minnesota Twins         |
| 118 | Kansas City Royals      | 143 | Philadelphia Phillies   |
| 119 | Los Angeles Dodgers     | 144 | Atlanta Braves          |
| 120 | Washington Nationals    | 145 | Chicago White Sox       |
| 121 | New York Mets           | 146 | Miami Marlins           |
| 147 | New York Yankees        | 158 | Milwaukee Brewers       |

API endpoint: `https://statsapi.mlb.com/api/v1/teams?sportId=1`

---

## 4. Authentication & CORS

**No authentication required.** All endpoints are publicly accessible.

**CORS fully open.** Both CDNs return:
```
access-control-allow-origin: *
```
Safe to embed directly in any web app via `<img>` tags or fetch().

---

## 5. Identifier Requirements

### MLB headshots require: MLB Stats API player ID (MLBAM ID)
- NOT the same as Yahoo Fantasy player_id
- Get from `https://statsapi.mlb.com/api/v1/people/{ID}`
- Or from team rosters: `https://statsapi.mlb.com/api/v1/teams/{TEAM_ID}/roster`

### Yahoo Fantasy API provides:
- `player_id` -- Yahoo's internal ID (different numbering from MLBAM)
- `headshot` -- Yahoo-hosted player photo (object with `url` and `size` keys)
- `image_url` -- Direct URL string to Yahoo-hosted player image
- `editorial_player_key` -- Format `mlb.p.{yahoo_player_id}` (still Yahoo's ID, not MLBAM)

### Yahoo-to-MLBAM ID Mapping
Yahoo player IDs and MLB Stats API IDs use **different numbering systems**.
Options for mapping:
1. **Smart Fantasy Baseball Player ID Map** -- CSV/Excel download with YAHOOID and MLBID columns
   https://www.smartfantasybaseball.com/tools/
2. **Name matching** -- Look up player by name via `statsapi.mlb.com/api/v1/people/search?names={name}`
3. **Use Yahoo headshots directly** -- Yahoo's `headshot.url` and `image_url` fields avoid the mapping problem entirely

---

## 6. Quick Reference - Copy/Paste URLs

```python
# Player headshot (JPEG, gray background)
HEADSHOT_URL = "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_{width},q_auto:best/v1/people/{mlb_id}/headshot/67/current"

# Player headshot (PNG, transparent background)
HEADSHOT_SILO_URL = "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_{width},q_auto:best/v1/people/{mlb_id}/headshot/silo/current"

# Team logo (SVG)
TEAM_LOGO_SVG = "https://www.mlbstatic.com/team-logos/{team_id}.svg"

# Team logo cap (SVG, dark background variant)
TEAM_CAP_SVG = "https://www.mlbstatic.com/team-logos/team-cap-on-dark/{team_id}.svg"

# Team logo (PNG, specific size)
TEAM_LOGO_PNG = "https://midfield.mlbstatic.com/v1/team/{team_id}/spots/{size}"

# Yahoo headshot (from API response)
# player["headshot"]["url"]  or  player["image_url"]
```
