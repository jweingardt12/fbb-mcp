# Yahoo Fantasy API Write Scope Removal: Community Findings

**Research Date:** February 15, 2026
**Status:** Yahoo has removed the Read/Write option for new Fantasy Sports developer apps.

---

## 1. When Did Yahoo Remove Write Permissions?

The removal was discovered in **mid-October 2025**. The key evidence:

- **GitHub Issue (uberfastman/yfpy #79):** On October 19, 2025, user `dvdrplus` (Mark Lepage) reported that he had created an app approximately one week prior (around Oct 12, 2025) that still had the Write option available. When he attempted to create a new production app days later, only the "Read" option was available for Fantasy Sports. The Read/Write option had been silently removed from the Yahoo Developer Network app creation page.
  - Source: https://github.com/uberfastman/yfpy/issues/79

- **Repository owner `uberfastman` (Wren) confirmed independently** on the same day: "the only Fantasy Sports option available now on my end as well is Read, so it seems they've officially deprecated the Write option."

- **No official announcement from Yahoo** was found. The change was silent -- Yahoo simply removed the Read/Write radio button from the developer app creation flow at https://developer.yahoo.com/apps/create/.

**Best estimate for the change:** Between approximately October 12-19, 2025.

---

## 2. Do Existing Apps With Write Scope Still Work?

**Yes, as of October 2025.**

- In yfpy issue #79, `dvdrplus` confirmed: "existing legacy app keys still function for writing."
- He was hesitant to modify his old app's credentials for fear of losing write capability.
- Repository owner `uberfastman` cautioned that "legacy clients may eventually lose write access too."

**Key implication for our project:** If the `yahoo-fantasy` Docker project's OAuth credentials were created before mid-October 2025 with Read/Write scope, they likely still work for write operations. **Do not regenerate or recreate those credentials.** Rotating keys or creating a new app will result in losing write access permanently.

---

## 3. Has Anyone Found a Way to Request Write Scope for New Apps?

**No confirmed method exists as of this research.**

- No one in the yfpy issue thread reported success contacting Yahoo to request write scope.
- The Yahoo Developer Network documentation at https://developer.yahoo.com/fantasysports/guide/ still references "select either Read or Read/Write access for Fantasy Sports" -- the documentation has not been updated to reflect the removal.
- There is no known special application process, appeal form, or partner program that grants write access.
- `dvdrplus` speculated the deprecation "aligns with Yahoo's Fantasy Plus promotional push," suggesting Yahoo may be restricting third-party write access to push users toward their premium subscription product.

**Sources checked:**
- https://developer.yahoo.com/fantasysports/guide/ (official docs, still mention Read/Write but option is gone)
- https://developer.yahoo.com/api/ (API overview page)
- https://github.com/uberfastman/yfpy/issues/79 (primary community discussion)

---

## 4. Community Workarounds

### 4a. Preserve Existing Legacy App Credentials

The most reliable "workaround" is simply not losing your existing app credentials. If your app was created before mid-October 2025 with Read/Write scope:
- Do NOT create a new app.
- Do NOT regenerate the client ID/secret.
- Do NOT modify the app's API permissions.
- Store the credentials securely; they may be irreplaceable.

### 4b. Browser Automation (Selenium/Puppeteer/Playwright)

Several community projects bypass the OAuth API entirely by automating the Yahoo Fantasy web interface using browser automation:

**start-active-players-bot** (Selenium, Python 2.7):
- Logs in with Yahoo username/password via Selenium WebDriver
- Navigates the Yahoo Fantasy Basketball UI to activate players
- Supports headless mode via PhantomJS/ChromeDriver
- Source: https://github.com/kmarhold/start-active-players-bot

**nba-start-active-players-bot** (Selenium, Python 2.7):
- Fork/variant of the above
- Same browser login + UI automation approach
- Source: https://github.com/devinmancuso/nba-start-active-players-bot

**Pros:** Bypasses OAuth scope restrictions entirely; can perform any action a browser user can.
**Cons:** Fragile (breaks when Yahoo changes UI); requires storing Yahoo login credentials; older projects (2015-era) likely need significant updates; violates Yahoo TOS for automated access.

### 4c. Session Cookie / Web API Approach (Theoretical)

**Not yet implemented by the community for write operations**, but the approach would be:

1. Log in to Yahoo via browser (or Selenium/Playwright)
2. Extract session cookies (e.g., `Y`, `T`, `F` cookies)
3. Use those cookies to call Yahoo's internal web API endpoints directly via HTTP requests
4. Yahoo Fantasy's web frontend makes API calls to internal endpoints that are separate from the public `fantasysports.yahooapis.com` API

**Evidence this approach works for Yahoo services:**
- The Yahoo Finance community has extensively documented cookie/crumb-based authentication to bypass API restrictions (see: https://www.codestudy.net/blog/yahoo-finance-api-get-quotes-returns-invalid-cookie/)
- Yahoo Finance's `yfinance` Python library uses this exact pattern: extract cookies + crumb token from browser session, then use them for API calls
- The same technique could theoretically apply to Yahoo Fantasy's internal endpoints

**Yahoo Fantasy internal endpoints** (observed from browser network tab):
- The public API is at `https://fantasysports.yahooapis.com/fantasy/v2/`
- The web app likely uses different internal endpoints for roster/transaction operations
- Would require reverse-engineering the web app's network requests

### 4d. Web Scraping (Read-Only)

Multiple projects exist for scraping Yahoo Fantasy data via BeautifulSoup/Scrapy, but these are read-only:
- https://github.com/andrewrgoss/yahoo-fantasy-fball-scraper (Selenium + BeautifulSoup)
- https://github.com/sbma44/yahoofantasyfootball (web scraper)

These don't help with write operations.

---

## 5. Yahoo's Public API Write Endpoints (For Reference)

The official Fantasy Sports API does support write operations at:

**Roster changes (PUT):**
```
PUT https://fantasysports.yahooapis.com/fantasy/v2/team/{team_key}/roster
```

**Transactions -- add/drop players (POST):**
```
POST https://fantasysports.yahooapis.com/fantasy/v2/league/{league_key}/transactions
```

These endpoints require the `fspt-w` OAuth scope. With `fspt-r` (read-only), they return:
> "You do not have the appropriate OAuth scope permissions to perform this action"

Libraries that support these write operations:
- `yahoo_fantasy_api` (Python, spilchen): Supports `add_and_drop_players()`, roster PUT operations
- `yfpy` (Python, uberfastman): Read-focused, write operations requested in issue #63
- `yahoo-fantasy-sports-api` (Node.js, whatadewitt): Supports add, drop, add/drop transactions
- `yahoo_fantasy_api` issue #49: Shows write operations working (FAB bid validation error, not scope error)

---

## 6. Relevant Forum Threads, GitHub Issues, and Discussions

### Primary Source -- yfpy Issue #79 (Most Important)
- **Title:** "Yahoo! removed Write access to Fantasy Sports API create app?"
- **URL:** https://github.com/uberfastman/yfpy/issues/79
- **Date:** October 19, 2025
- **Status:** Open, unresolved
- **Key participants:** dvdrplus (reporter), uberfastman (repo owner)
- **Summary:** Confirms Yahoo silently removed the Read/Write option from the developer app creation page. Existing apps with write scope still work. No workaround found.

### yfpy Issue #63 -- Feature Request for Write Operations
- **Title:** "[Feature Request] Transaction sender for trade proposal and waiver-wire claims"
- **URL:** https://github.com/uberfastman/yfpy/issues/63
- **Date:** October 15, 2024
- **Summary:** User requested write functionality for trades and waivers. No implementation yet.

### yfpy Issue #62 -- OAuth Error
- **Title:** "[Bug] OAuth Error - How to get access token for private league"
- **URL:** https://github.com/uberfastman/yfpy/issues/62
- **Date:** October 11, 2024
- **Summary:** Authentication challenges with OAuth; potentially related to scope restrictions.

### Pipedream Feature Request -- Read/Write Scope
- **Title:** "Yahoo Fantasy Sports - Read/Write OAuth scope"
- **URL:** https://pipedream.com/community/t/yahoo-fantasy-sports-read-write-oauth-scope/1207
- **Date:** September 13, 2021
- **Summary:** Pipedream's Yahoo Fantasy integration only requested `fspt-r` (read-only) scope. Users requested `fspt-w` (read/write) support. GitHub issue #1721 was created but no resolution posted.

### yahoo_fantasy_api Issue #49 -- Waiver Add Error
- **Title:** "I'm getting a runtime error when trying to add player on waiver list"
- **URL:** https://github.com/spilchen/yahoo_fantasy_api/issues/49
- **Date:** January 11, 2024
- **Summary:** User successfully made write API calls (POST transaction) but hit a FAB bid validation error. This shows the write API was functional in Jan 2024 with proper scope. The wrapper lacked FAB bid support.

### whatadewitt/yahoo-fantasy-sports-api Issue #87
- **Title:** "Support for adding and dropping players"
- **URL:** https://github.com/whatadewitt/yahoo-fantasy-sports-api/issues/87
- **Date:** November 4, 2021
- **Summary:** Feature request for add/drop support in the Node.js wrapper.

---

## 7. Recommendations for Our Project

### Immediate Actions
1. **Verify our current OAuth credentials** -- Check if the `yahoo-fantasy` app's OAuth tokens were created before October 2025 with `fspt-w` scope. If so, they are extremely valuable and must be preserved.
2. **Test write operations now** -- Confirm add/drop, lineup changes, and trade operations still work with our existing credentials.
3. **Back up OAuth credentials** -- Store the client ID, client secret, and refresh token securely. These cannot be recreated with write scope.

### If We Need Write Access and Don't Have Legacy Credentials
The options in order of feasibility:

1. **Find someone with legacy credentials** -- Anyone who created a Yahoo Developer app with Read/Write scope before October 2025 could share their app credentials (though this has security/TOS implications).

2. **Browser automation with Playwright** -- Build a Playwright-based automation layer that:
   - Logs into Yahoo Fantasy via browser
   - Extracts session cookies
   - Makes write operations either through UI automation or by reverse-engineering the internal web API endpoints
   - This is the most robust workaround but requires significant development effort.

3. **Session cookie proxy approach** -- Build a service that:
   - Maintains an authenticated Yahoo session (via automated login)
   - Extracts session cookies
   - Proxies write requests through the internal Yahoo Fantasy web API using those cookies
   - Similar to how `yfinance` handles Yahoo Finance's cookie/crumb system

4. **Contact Yahoo Developer Relations** -- File a support ticket at Yahoo Developer Network requesting write scope. Low probability of success but costs nothing to try. No one in the community has reported trying this.

### What NOT to Do
- Do NOT create a new Yahoo Developer app expecting to get write scope -- it is no longer available.
- Do NOT modify or regenerate existing app credentials that have write scope.
- Do NOT rely on Yahoo restoring write scope for new apps -- the trend is toward restricting third-party access, not expanding it.

---

## 8. Timeline of Events

| Date | Event |
|------|-------|
| Pre-2021 | Yahoo Fantasy API Read/Write scope available for all new apps |
| Sep 2021 | Pipedream users request `fspt-w` scope support (was available but Pipedream only used `fspt-r`) |
| Jan 2024 | `yahoo_fantasy_api` write operations confirmed working (issue #49, FAB bid error) |
| Oct 2024 | yfpy users request write operation features (issues #62, #63) |
| ~Oct 12, 2025 | Last known date when Read/Write option was still available for new apps |
| Oct 19, 2025 | `dvdrplus` discovers Read/Write option removed; confirmed by `uberfastman` |
| Oct 19, 2025 | Speculation that change is related to Yahoo Fantasy Plus monetization |
| Feb 2026 | No resolution; existing legacy apps still work for writes |
