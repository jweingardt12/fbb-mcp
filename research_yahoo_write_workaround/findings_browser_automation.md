# Browser Automation for Yahoo Fantasy Write Operations

Research Date: 2026-02-15

## Problem Statement

The Yahoo Fantasy Sports OAuth API only grants read scope for third-party apps. Write operations (add/drop players, set lineups, propose trades) require either Yahoo's internal write scope (not available to public apps) or an alternative approach. This document evaluates browser automation as a workaround.

---

## 1. Existing GitHub Projects

### Selenium-Based Projects

**[nba-start-active-players-bot](https://github.com/devinmancuso/nba-start-active-players-bot)** (devinmancuso)
- Python + Selenium script for Yahoo Fantasy Basketball
- Logs into Yahoo, navigates to roster page, clicks "Start Active Players" for N days
- Login flow:
  ```python
  driver.get('https://login.yahoo.com/config/login?.src=spt&.intl=us&.done=http%3A%2F%2Fbasketball.fantasysports.yahoo.com%2Fnba')
  driver.find_element_by_id('login-username').send_keys(username)
  driver.find_element_by_id('login-passwd').send_keys(password)
  time.sleep(8)
  driver.find_element_by_name('signin').click()
  time.sleep(8)
  ```
- Roster manipulation: Clicks "Start Active Players" link, then advances to next day
- Limitations: Uses deprecated Selenium APIs, fixed `time.sleep()` waits (8 seconds), no CAPTCHA handling, no error recovery
- Fork: [kmarhold/start-active-players-bot](https://github.com/kmarhold/start-active-players-bot)

**[selenium-fantasy-hockey](https://github.com/phutkins/selenium-fantasy-hockey)** (phutkins)
- Automates Chrome to put in available players for the next X days in Yahoo Fantasy Hockey
- Similar Selenium-based approach

### API-Based Projects (Use Yahoo Write Scope)

**[yahoo_fantasy_bot](https://github.com/spilchen/yahoo_fantasy_bot)** (spilchen)
- Full roster management bot for Yahoo Fantasy leagues
- **Requires read AND write OAuth scope** -- setup instructions explicitly state: "request read and write access, since we need write access to make changes to your roster"
- Performs add/drop, position changes, IR moves via the Yahoo Fantasy API directly
- Available on [PyPI](https://pypi.org/project/yahoo-fantasy-bot/)
- Key insight: This proves the Yahoo API does support write operations -- the constraint is getting write scope approved for your app

**[fantasy-football-bot](https://github.com/amarvin/fantasy-football-bot)** (amarvin)
- Scrapes player forecasts, runs optimization to decide add/drop moves
- Uses `ffbot.optimize()` to find optimal roster configurations
- 253 commits, 26 releases -- mature project
- Architecture unclear on whether it uses API or browser for the actual transaction execution

**[fantasy-autoplay](https://github.com/boyte/fantasy-autoplay)** (boyte)
- Described as "interface between a predictive baseball program and the Yahoo Fantasy Sports API"
- Currently only reads data (standings, roster, stats)
- Uses `requests` + `requests-oauth` + `beautifulsoup`
- Add/drop functionality listed as "Next Steps" -- never implemented

### Key Takeaway

Most functional Yahoo Fantasy bots use the OAuth API with write scope, NOT browser automation. The Selenium-based projects are limited to simple actions (start active players) and are fragile. No production-quality Playwright-based Yahoo Fantasy project was found.

---

## 2. Yahoo Login & Anti-Bot Protections

### Yahoo's Login Flow

Yahoo uses a multi-step login process:
1. Username entry on first page (`login-username` field)
2. After submitting username, a second page asks for password (`login-passwd` field)
3. Yahoo may insert additional challenge steps between or after these

### Known Anti-Bot Measures

**CAPTCHA:**
- Yahoo has historically used CAPTCHAs on login, though the current implementation varies
- Modern invisible reCAPTCHA v3 uses behavioral analysis and risk scoring rather than explicit challenges
- CAPTCHA solving services (CapSolver, 2Captcha) charge $0.80-$2.80 per 1,000 solves -- affordable but add complexity and a dependency on external services
- Source: [ScrapingAnt - Headless vs Headful Browsers 2025](https://scrapingant.com/blog/headless-vs-headful-browsers-in-2025-detection-tradeoffs)

**Device Verification / 2FA:**
- Yahoo may prompt "Verify it's you" via email or SMS to a registered recovery method
- This is triggered by unrecognized devices, new IP addresses, or suspicious login patterns
- Headless browsers with fresh profiles are especially likely to trigger this
- Persisting browser profile data (cookies, local storage) reduces re-triggering

**Headless Browser Detection:**
- Websites can detect headless Chromium via navigator properties, WebGL fingerprints, and missing browser plugins
- Modern Playwright/Puppeteer apply stealth patches, but detection is an arms race
- Headful (headed) mode is harder to detect but requires a display server (Xvfb in Docker)
- Source: [ScrapingAnt - Headless vs Headful Browsers 2025](https://scrapingant.com/blog/headless-vs-headful-browsers-in-2025-detection-tradeoffs)

**Rate Limiting:**
- Yahoo likely rate-limits login attempts per IP/account
- Automated scripts with fixed `time.sleep()` patterns may be fingerprinted

### Practical Risk Assessment

- **First login from a new Docker container:** High risk of CAPTCHA or device verification
- **Subsequent requests with persisted session:** Low risk if cookies are maintained
- **Roster operations after login:** Low risk -- Yahoo's anti-bot focus is on login, not on in-app navigation
- **Long-term reliability:** Medium risk -- Yahoo can change login flow, HTML structure, or add new bot detection at any time, breaking the automation

---

## 3. Docker Overhead for Playwright/Headless Chromium

### Image Size

| Configuration | Approximate Size |
|---|---|
| Full Playwright image (all 3 browsers) | ~2 GB |
| Playwright with Chromium only (official base) | ~1.5 GB |
| Custom minimal build (Ubuntu + Node + Chromium deps only) | ~800 MB - 1 GB |
| Optimized distroless build (stripped dependencies) | ~400 MB (compressed ~80 MB) |

Sources:
- [Playwright Docker Issue #29356](https://github.com/microsoft/playwright/issues/29356) -- "total size approximately 2GB"
- [Playwright Docker Issue #10168](https://github.com/microsoft/playwright/issues/10168) -- user reported 1.94 GB; optimized to ~80 MB compressed
- [Distroless Playwright Optimization](https://medium.com/@thananjayan1988/optimize-the-docker-image-for-playwright-tests-3688c7d4be5f)

**Size reduction tips:**
- Start from `ubuntu:noble` instead of `mcr.microsoft.com/playwright`
- Install only Chromium: `npx playwright install --with-deps chromium`
- Remove Python from the image (saves ~600 MB)
- Use `ldd` to identify strictly needed shared libraries and remove extras
- Source: [Playwright Issue #10168](https://github.com/microsoft/playwright/issues/10168)

### Memory Usage

| Metric | Value |
|---|---|
| Minimum recommended per container | 2 GB |
| Per concurrent browser instance | ~1 GB |
| Peak Chromium headless memory | ~826 MB |
| Idle browser with one tab | ~200-400 MB |

Source: [Playwright Docker docs](https://playwright.dev/docs/docker)

### Impact on Current Container

The current `yahoo-fantasy` container runs Python + Node.js. Adding Playwright/Chromium would:
- Increase image size by 800 MB to 1.5 GB (depending on optimization)
- Add ~500-800 MB runtime memory when browser is active
- Require `--ipc=host` or `--shm-size=2gb` Docker flag to prevent Chromium OOM crashes
- Require `--init` flag to prevent zombie processes

### Docker Configuration Required

```yaml
# docker-compose.yml additions
services:
  yahoo-fantasy:
    shm_size: '2gb'
    init: true
    # Or alternatively:
    # ipc: host
```

---

## 4. Session Persistence Across Container Restarts

### Approach A: Playwright `storageState` (Recommended for Docker)

Save cookies + localStorage to a JSON file, mount as a Docker volume.

```typescript
// After login, save state
await page.context().storageState({ path: '/data/yahoo-auth.json' });

// On next startup, restore state
const context = await browser.newContext({
  storageState: '/data/yahoo-auth.json'
});
```

- Saves: cookies, localStorage, IndexedDB
- Does NOT save: sessionStorage (tab-specific, lost on browser close)
- File is a simple JSON -- easy to mount as a volume, back up, inspect
- Source: [Playwright Auth docs](https://playwright.dev/docs/auth)

### Approach B: Persistent Browser Context (`userDataDir`)

Save the entire Chrome profile directory, mount as a Docker volume.

```typescript
// Uses a persistent directory for all browser data
const context = await chromium.launchPersistentContext('/data/chrome-profile', {
  headless: true,
});
```

- Saves: everything (cookies, cache, localStorage, history, extensions, passwords)
- More complete than storageState but larger (~50-200 MB of profile data)
- Closer to how a real user's browser behaves
- Less likely to trigger "new device" detection on Yahoo
- Source: [Playwright Persistent Context docs](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context)

### Session Lifetime Concerns

- Yahoo session cookies typically expire after 2-4 weeks of inactivity
- The `Y` and `T` cookies are the primary session tokens
- If the session expires, the bot must re-login (potentially facing CAPTCHA/2FA)
- Strategy: Run a periodic "session refresh" that loads Yahoo in the persisted context to keep cookies fresh

### Docker Volume Mount

```yaml
services:
  yahoo-fantasy:
    volumes:
      - yahoo-browser-data:/data/chrome-profile

volumes:
  yahoo-browser-data:
```

---

## 5. Lighter Alternatives to Full Browser Automation

### Option A: `requests` + Cookie Jar (Lightest)

Use Python `requests.Session()` with manually obtained cookies.

```python
import requests

session = requests.Session()
# Load cookies from a file (obtained from a real browser session)
session.cookies.update(saved_cookies)

# Make Yahoo Fantasy roster move via form POST
response = session.post(
    'https://baseball.fantasysports.yahoo.com/b2/16960/addplayer',
    data={
        'crumb': crumb_token,  # CSRF token from page
        'player_id': '12345',
        'drop_player_id': '67890',
    },
    headers={'Referer': 'https://baseball.fantasysports.yahoo.com/b2/16960/players'}
)
```

**Pros:**
- Zero additional Docker footprint
- Fast execution (no browser rendering)
- No memory overhead

**Cons:**
- Must reverse-engineer Yahoo's form parameters and CSRF tokens
- Yahoo uses JavaScript-rendered content -- some pages may not work without JS execution
- Session management is manual
- Fragile: HTML form structure changes break everything
- Cannot handle JavaScript-heavy interactions (dynamic dropdowns, confirmation modals)

### Option B: MechanicalSoup (Light)

Wraps `requests` + BeautifulSoup with stateful form handling.

```python
import mechanicalsoup

browser = mechanicalsoup.StatefulBrowser()
browser.open('https://login.yahoo.com')
browser.select_form()
browser['username'] = 'user@yahoo.com'
browser.submit_selected()
```

**Pros:**
- Automatic cookie/session management
- Built-in form parsing and submission
- Much lighter than Playwright (~20 KB library vs ~800 MB browser)
- Source: [MechanicalSoup Guide](https://rebrowser.net/blog/mechanicalsoup-the-smart-developers-guide-to-python-web-scraping)

**Cons:**
- Cannot execute JavaScript -- Yahoo's login flow likely requires JS
- Yahoo's login uses AJAX calls that MechanicalSoup cannot handle
- Modern Yahoo pages are heavily JavaScript-dependent
- Likely blocked by Yahoo's login anti-bot (expects browser fingerprint)

### Option C: Hybrid Approach -- Playwright for Login, requests for Actions

Use Playwright only for the initial login to obtain session cookies, then switch to lightweight `requests` for all subsequent API/form calls.

```typescript
// 1. Playwright: Login and capture cookies
const context = await browser.newContext();
const page = await context.newPage();
await page.goto('https://login.yahoo.com');
// ... complete login flow ...
const cookies = await context.cookies();
// Save cookies to file
fs.writeFileSync('/data/yahoo-cookies.json', JSON.stringify(cookies));
await browser.close();
```

```python
# 2. Python requests: Use cookies for roster moves
import json, requests

with open('/data/yahoo-cookies.json') as f:
    cookies = {c['name']: c['value'] for c in json.load(f)}

session = requests.Session()
for name, value in cookies.items():
    session.cookies.set(name, value)

# Now make roster moves via HTTP
response = session.get('https://baseball.fantasysports.yahoo.com/b2/16960/team')
```

**Pros:**
- Playwright handles the hard part (JavaScript login, CAPTCHA, device verification)
- Subsequent operations are fast and lightweight
- Browser process can be shut down after login (saves memory)
- Session cookies typically last weeks

**Cons:**
- Still need to reverse-engineer Yahoo's form POST parameters for roster moves
- Some roster operations may require JavaScript execution (confirmation dialogs)
- Must handle CSRF/crumb tokens from Yahoo pages

### Option D: Playwright On-Demand (Recommended)

Keep Playwright installed but only launch the browser when a write operation is needed. Browser stays closed during normal operation (reads via OAuth API).

```typescript
async function performRosterMove(action: string, params: object) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: '/data/yahoo-auth.json'  // Persisted login
  });
  const page = await context.newPage();

  // Navigate and perform action
  await page.goto('https://baseball.fantasysports.yahoo.com/b2/16960/team');
  // ... click buttons, fill forms ...

  // Save updated session
  await context.storageState({ path: '/data/yahoo-auth.json' });
  await browser.close();
}
```

**Pros:**
- Memory only used during write operations (a few seconds at a time)
- Full JavaScript execution -- handles any Yahoo UI complexity
- storageState persists session between invocations
- No need to reverse-engineer form parameters -- just click what a user would click

**Cons:**
- Browser launch adds ~2-5 seconds latency per operation
- Still adds ~800 MB to Docker image size
- Must maintain page selectors as Yahoo updates their UI

---

## 6. Recommendation

### Best Architecture: Option D (Playwright On-Demand)

For the yahoo-fantasy MCP server, the recommended approach is:

1. **Keep OAuth API for all read operations** -- fast, reliable, officially supported
2. **Add Playwright (Chromium only) for write operations** -- launched on-demand, not always running
3. **Persist session with `storageState`** -- mount as Docker volume, refresh periodically
4. **Initial login done interactively** -- first time, user logs into Yahoo via a headed browser or web UI, session saved to file
5. **Fall back gracefully** -- if session expires and re-login fails (CAPTCHA), notify user to re-authenticate manually

### Implementation Plan

```
Phase 1: Add Playwright to Docker image (Chromium only, optimized build)
Phase 2: Implement session management (storageState save/load, volume mount)
Phase 3: Implement login flow (with manual fallback for CAPTCHA/2FA)
Phase 4: Implement write operations one at a time:
  - Set lineup (easiest -- just click "Start Active Players" or drag/drop)
  - Add/drop player (form-based, moderate complexity)
  - Propose trade (multi-step wizard, highest complexity)
Phase 5: Add session refresh cron to prevent expiration
```

### Estimated Overhead

| Metric | Current | With Playwright |
|---|---|---|
| Docker image size | ~500 MB (est.) | ~1.3-1.8 GB |
| Idle memory | ~200 MB | ~200 MB (browser not running) |
| Memory during write op | ~200 MB | ~800-1000 MB (browser active) |
| Write operation latency | N/A | ~3-10 seconds |

### Risk Factors

- **Yahoo UI changes:** Yahoo can redesign their fantasy UI at any time, breaking selectors. Mitigation: Use resilient selectors (data attributes, text content) over brittle CSS selectors.
- **Anti-bot escalation:** Yahoo could add more aggressive bot detection. Mitigation: Use headed mode via Xvfb if headless is detected, persist realistic browser profile.
- **Session expiration:** Sessions expire after inactivity. Mitigation: Periodic refresh task, graceful re-auth notification.
- **Legal/ToS considerations:** Automating Yahoo via browser may violate their Terms of Service. This is a personal-use tool for managing your own team.

---

## Sources

- [nba-start-active-players-bot](https://github.com/devinmancuso/nba-start-active-players-bot) -- Selenium Yahoo Fantasy login + roster automation
- [yahoo_fantasy_bot](https://github.com/spilchen/yahoo_fantasy_bot) -- API-based bot requiring write scope
- [fantasy-football-bot](https://github.com/amarvin/fantasy-football-bot) -- Yahoo Fantasy Football optimizer
- [fantasy-autoplay](https://github.com/boyte/fantasy-autoplay) -- Yahoo Fantasy API + BeautifulSoup
- [selenium-fantasy-hockey](https://github.com/phutkins/selenium-fantasy-hockey) -- Selenium Yahoo Fantasy Hockey
- [Playwright Docker docs](https://playwright.dev/docs/docker) -- Official Docker guidance
- [Playwright Auth docs](https://playwright.dev/docs/auth) -- storageState and session persistence
- [Playwright Docker Issue #10168](https://github.com/microsoft/playwright/issues/10168) -- Image size optimization (1.94 GB baseline, 80 MB optimized)
- [Playwright Docker Issue #29356](https://github.com/microsoft/playwright/issues/29356) -- Image size ~2 GB with all browsers
- [ScrapingAnt - Headless vs Headful 2025](https://scrapingant.com/blog/headless-vs-headful-browsers-in-2025-detection-tradeoffs) -- Bot detection landscape
- [MechanicalSoup Guide](https://rebrowser.net/blog/mechanicalsoup-the-smart-developers-guide-to-python-web-scraping) -- Lightweight browser alternative
- [ScrapeOps - Selenium vs Requests](https://scrapeops.io/python-web-scraping-playbook/python-selenium-vs-python-requests/) -- Performance comparison
- [Distroless Playwright](https://medium.com/@thananjayan1988/optimize-the-docker-image-for-playwright-tests-3688c7d4be5f) -- Docker image optimization
