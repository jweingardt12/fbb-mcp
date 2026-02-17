# Research: Yahoo Fantasy Write Operations Workaround

## Main Question
Yahoo no longer grants write (read/write) OAuth scope for Fantasy Sports apps. The OAuth API rejects POST/PUT requests with "You do not have the appropriate OAuth scope permissions." How can we perform write operations (add/drop players, set lineups, propose trades) programmatically?

## Subtopics

### 1. Yahoo Fantasy Web Form Endpoints
What endpoints does the Yahoo Fantasy website use when a user adds/drops a player or changes their lineup through the browser? What does the HTTP traffic look like (URLs, methods, payloads, cookies/headers)?

### 2. Browser Automation Approaches (Playwright/Selenium)
What existing projects or approaches use browser automation to interact with Yahoo Fantasy? How do they handle Yahoo login (anti-bot, 2FA)? What's the overhead (image size, performance)?

### 3. Session Cookie Authentication
Can Yahoo session cookies be used to call the Fantasy Sports API directly (bypassing OAuth)? Are there ways to programmatically obtain Yahoo session cookies? What about cookie-based auth with the web form endpoints?

### 4. Community Workarounds
What workarounds has the Yahoo Fantasy developer community found for the write scope restriction? Check Reddit, GitHub issues, Stack Overflow, and Yahoo developer forums.

## Synthesis
Compare approaches on: reliability, complexity, maintenance burden, Docker compatibility, and user experience. Recommend the best path forward.
