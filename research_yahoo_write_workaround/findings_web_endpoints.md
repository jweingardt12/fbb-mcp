# Yahoo Fantasy Write Operations: Web Endpoints Research Findings

## Research Date: 2026-02-15

---

## 1. Two Separate Systems: Official API vs. Web Interface

Yahoo Fantasy has **two distinct systems** for performing write operations:

### A. Official Fantasy Sports API (`fantasysports.yahooapis.com`)
- Public, documented (poorly), OAuth2-authenticated REST API
- Accepts XML payloads for POST/PUT operations
- Base URL: `https://fantasysports.yahooapis.com/fantasy/v2/`
- This is what `yahoo_fantasy_api` (Python) and `yahoo-fantasy-sports-api` (Node.js) use

### B. Web Interface (`baseball.fantasysports.yahoo.com`)
- Internal browser-based form submissions
- Uses cookie-based sessions + crumb/CSRF tokens
- URL pattern: `https://baseball.fantasysports.yahoo.com/b1/{league_id}/...`
- **Not publicly documented** -- would require browser DevTools inspection to reverse-engineer

The web interface does **NOT** call the `fantasysports.yahooapis.com` API. They are separate systems with separate authentication.

---

## 2. Official API Write Endpoints (Documented)

### Add Player (POST)
- **Method**: `POST`
- **URL**: `https://fantasysports.yahooapis.com/fantasy/v2/league/{league_key}/transactions`
- **Content-Type**: `application/xml`
- **Auth**: OAuth2 Bearer token
- **Payload**:
```xml
<?xml version="1.0" ?>
<fantasy_content>
  <transaction>
    <type>add</type>
    <player>
      <player_key>469.p.{player_id}</player_key>
      <transaction_data>
        <type>add</type>
        <destination_team_key>469.l.16960.t.12</destination_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>
```

### Drop Player (POST)
- **Method**: `POST`
- **URL**: `https://fantasysports.yahooapis.com/fantasy/v2/league/{league_key}/transactions`
- **Content-Type**: `application/xml`
- **Auth**: OAuth2 Bearer token
- **Payload**:
```xml
<?xml version="1.0" ?>
<fantasy_content>
  <transaction>
    <type>drop</type>
    <player>
      <player_key>469.p.{player_id}</player_key>
      <transaction_data>
        <type>drop</type>
        <source_team_key>469.l.16960.t.12</source_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>
```

### Add/Drop Player (POST)
- **Method**: `POST`
- **URL**: `https://fantasysports.yahooapis.com/fantasy/v2/league/{league_key}/transactions`
- **Content-Type**: `application/xml`
- **Auth**: OAuth2 Bearer token
- **Payload**:
```xml
<?xml version="1.0" ?>
<fantasy_content>
  <transaction>
    <type>add/drop</type>
    <players>
      <player>
        <player_key>469.p.{add_player_id}</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>469.l.16960.t.12</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>469.p.{drop_player_id}</player_key>
        <transaction_data>
          <type>drop</type>
          <source_team_key>469.l.16960.t.12</source_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

### Add Player with FAAB Bid (POST)
- Same as Add Player, but includes `<faab_bid>` element:
```xml
<fantasy_content>
  <transaction>
    <type>add</type>
    <faab_bid>25</faab_bid>
    <player>
      ...
    </player>
  </transaction>
</fantasy_content>
```

### Change Lineup / Set Roster Positions (PUT)
- **Method**: `PUT`
- **URL**: `https://fantasysports.yahooapis.com/fantasy/v2/team/{team_key}/roster`
- **Content-Type**: `application/xml`
- **Auth**: OAuth2 Bearer token
- **Payload** (date-based for baseball):
```xml
<?xml version="1.0" ?>
<fantasy_content>
  <roster>
    <coverage_type>date</coverage_type>
    <date>2026-04-01</date>
    <players>
      <player>
        <player_key>469.p.8332</player_key>
        <position>1B</position>
      </player>
      <player>
        <player_key>469.p.1423</player_key>
        <position>BN</position>
      </player>
    </players>
  </roster>
</fantasy_content>
```
- Only players whose positions you want to change need to be included
- Other players remain in their current positions

### Accept/Reject Trade (PUT)
- **Method**: `PUT`
- **URL**: `https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction_key}`
- **Content-Type**: `application/xml`
- **Auth**: OAuth2 Bearer token

---

## 3. Web Interface Endpoints (Reverse-Engineered / Inferred)

The web interface is **NOT** publicly documented. Based on research, the following is known or inferred:

### URL Structure
- Base: `https://baseball.fantasysports.yahoo.com/b1/{league_id}`
- Team page: `https://baseball.fantasysports.yahoo.com/b1/{league_id}/{team_number}`
- Players/Free agents: `https://baseball.fantasysports.yahoo.com/b1/{league_id}/players`
- Transactions: `https://baseball.fantasysports.yahoo.com/b1/buzzindex`
- Player changes: `https://baseball.fantasysports.yahoo.com/b1/playerchanges`

### Authentication: Cookie + Crumb System
Yahoo's web interface uses a **cookie + crumb** CSRF protection system (observed across Yahoo products):

1. **Session Cookie**: The Yahoo `Y` and `T` cookies (or the unified `B` cookie) establish the session identity. These are set when the user logs in through Yahoo's login page.

2. **Crumb Token**: A short, unique token generated by Yahoo that is:
   - Embedded in the page HTML (often in a JavaScript object or hidden form field)
   - Tied to the session cookie -- a crumb is only valid with the cookie it was issued alongside
   - Required on every POST/PUT/mutation request
   - Short-lived and rotates frequently (Yahoo tightened this circa 2023)

3. **How the crumb is obtained** (based on Yahoo Finance pattern):
   - Make a GET request to a page while maintaining session cookies
   - Extract the crumb from the page source (often embedded in a JS variable like `window.YAHOO.context.crumb` or in a hidden form field)
   - Include the crumb as a form parameter or query parameter on subsequent POST requests

4. **Headers required**:
   - `Cookie`: Session cookies
   - `User-Agent`: Must be a realistic browser user-agent (Yahoo blocks generic/bot user-agents)
   - `Referer`: Likely required to match the originating page
   - `X-Requested-With: XMLHttpRequest` (for AJAX-style submissions)

### Form Payload Format (Inferred)
The web interface likely uses **form-encoded** (`application/x-www-form-urlencoded`) POST submissions, not XML or JSON. Typical Yahoo web forms include:
- `crumb` - the CSRF token
- Player/roster identifiers
- Action type parameters

**Note**: Without actually inspecting the live site with browser DevTools, the exact form field names are unknown. Publicly available scrapers (Selenium-based) bypass this by driving a real browser that handles cookies/crumbs automatically.

---

## 4. Selenium/Browser Automation Approach

Multiple open-source projects automate Yahoo Fantasy using **Selenium** (browser automation) rather than raw HTTP requests, specifically because the web interface's crumb/CSRF system is difficult to replicate:

- [yahoo-fantasy-fball-scraper](https://github.com/andrewrgoss/yahoo-fantasy-fball-scraper) - Selenium + BeautifulSoup for data extraction
- [fantasy-football-bot](https://github.com/amarvin/fantasy-football-bot) - Uses the official API for writes, web scraping (GET only) for supplemental data
- [yahoofantasyfootball](https://github.com/sbma44/yahoofantasyfootball) - PhantomJS-based (deprecated headless browser), acknowledged as "inherently unreliable"

**Key takeaway**: No public project was found that successfully performs write operations (add/drop/lineup) via raw HTTP POST to the web interface. All projects that perform writes use the official API with OAuth2.

---

## 5. Key Differences: API vs. Web Interface

| Aspect | Official API | Web Interface |
|--------|-------------|---------------|
| Base URL | `fantasysports.yahooapis.com/fantasy/v2/` | `baseball.fantasysports.yahoo.com/b1/` |
| Auth | OAuth2 Bearer token | Yahoo session cookies + crumb |
| Payload format | XML | Form-encoded (inferred) |
| Content-Type | `application/xml` | `application/x-www-form-urlencoded` (inferred) |
| CSRF protection | None (OAuth2 handles auth) | Crumb token embedded in page |
| Documentation | Partial (developer.yahoo.com) | None (internal) |
| Rate limiting | Unknown (not documented) | Standard web rate limiting |
| Reliability | Stable but has known bugs | Subject to HTML/JS changes |

---

## 6. Practical Recommendations

### For Write Operations, Use the Official API
The official API at `fantasysports.yahooapis.com` is the **only reliable and documented** way to perform write operations:
- POST to `/league/{league_key}/transactions` for add/drop
- PUT to `/team/{team_key}/roster` for lineup changes
- PUT to `/transaction/{transaction_key}` for trade actions

### The `yahoo_fantasy_api` Python Library Already Implements This
The library at [spilchen/yahoo_fantasy_api](https://github.com/spilchen/yahoo_fantasy_api) has working implementations:
- `team.add_player(player_id)` - Add a free agent
- `team.drop_player(player_id)` - Drop a player
- `team.add_and_drop_players(add_id, drop_id)` - Add/drop in one transaction
- `team.claim_player(player_id, faab=amount)` - Waiver claim with FAAB bid
- `team.change_positions(date, lineup)` - Set lineup for a date

### If You Must Use the Web Interface
If the API is insufficient (e.g., missing endpoints, broken functionality):
1. **Selenium/Playwright** is the most reliable approach -- it handles cookies, crumbs, and JavaScript automatically
2. **Raw HTTP** is theoretically possible but requires:
   - Maintaining a full Yahoo session (login flow, cookie management)
   - Extracting the crumb token from each page before submitting
   - Matching exact form field names (requires DevTools inspection)
   - Realistic browser headers (User-Agent, Referer, etc.)
   - Handling frequent changes to Yahoo's page structure

---

## Sources

- [Yahoo Fantasy Sports API Guide](https://developer.yahoo.com/fantasysports/guide/)
- [yahoo_fantasy_api Python library (spilchen)](https://github.com/spilchen/yahoo_fantasy_api) - team.py, yhandler.py source code
- [Yahoo Fantasy Sports API Roster Resource Docs](https://yahoofantasysportsapidocs.readthedocs.io/guide/roster-resource/)
- [yahoo-fantasy-sports-api Node.js wrapper](https://github.com/whatadewitt/yahoo-fantasy-sports-api)
- [Yahoo Finance crumb/cookie system explained](https://www.codestudy.net/blog/yahoo-finance-api-get-quotes-returns-invalid-cookie/)
- [Fantasy Football Bot (amarvin)](https://github.com/amarvin/fantasy-football-bot)
- [Bots Over Ball: Fantasy Football Automated](https://www.lambdasandlapdogs.com/blog/bots-over-ball-fantasy-football-automated)
- [yahoo-fantasy-fball-scraper (Selenium)](https://github.com/andrewrgoss/yahoo-fantasy-fball-scraper)
- [yahoofantasyfootball (PhantomJS scraper)](https://github.com/sbma44/yahoofantasyfootball)
- [Yahoo OAuth2 Authorization Code Flow](https://developer.yahoo.com/oauth2/guide/flows_authcode/)
- [Yahoo Fantasy Node Docs - Transaction Resource](https://yahoo-fantasy-node-docs.vercel.app/resource/transaction)
