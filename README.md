# Blocked traversal across a plain fragment entry

Minimal reproducer for `@tanstack/react-router` 1.170.39 (`@tanstack/history` 1.162.4).

A plain `<a href="#fragment">` makes the browser create a same-document history
entry without router state. `parseHref` gives it `__TSR_index: 0`, so the delta
of any traversal across it is wrong, and undoing a blocked traversal
(`history.go(-delta)`) lands on the wrong entry or reloads the page.

## Run

```sh
npm install
npm run dev
```

1. Click **Add history entry** (Step 1), then **Plain fragment link** (`/?step=1#fragment`).
2. Type in **Draft**.
3. Click **History back**, then **Stay here**: the app ends up on a different
   entry instead of staying on `/?step=1#fragment`.
4. Repeat from step 1 with **History go(-2)**, then **Stay here**: the page
   reloads (`go(0)`), with the native "Leave site?" dialog, and the draft is lost.

Expected: after **Stay here**, the URL stays `/?step=1#fragment` and the draft is kept.

## Automated

```sh
npx playwright install chromium
npm test
```

`tests/repro.spec.ts` asserts the expected behaviour; it fails on the current
release. The GitHub Actions run of this repository shows the failure.
