# Blocked traversal across a plain fragment entry

Minimal reproducer for `@tanstack/react-router` 1.170.39 (`@tanstack/history` 1.162.4).

A plain `<a href="#fragment">` makes the browser create a same-document history
entry without router state. `parseHref` gives it `__TSR_index: 0`, so the delta
of any traversal across it is wrong, and undoing a blocked traversal
(`history.go(-delta)`) lands on the wrong entry, or calls `go(0)` and leaves the
refused traversal in place.

## Run

```sh
npm install
npm run dev
```

1. Click **Add history entry** (Step 1), then **Plain fragment link**. History is now
   `/?step=0` → `/?step=1` → `/?step=1#fragment`, the last entry created by the browser.
2. Type in **Draft** (the blocker is now active).
3. Click **History back** (or **History go(-2)**), then **Stay here**.

Actual: the app is left on `/?step=0` (Step 0) in both cases.

- **back** reaches `/?step=1` (index 1) from the fragment entry (read as index 0),
  so the delta is +1: it is reported as `FORWARD`, and the blocked traversal is
  "undone" with `go(-1)`, one entry further back.
- **go(-2)** reaches `/?step=0` (index 0) from the fragment entry (index 0), so
  the delta is 0 and the undo is `go(0)`: the refused traversal stands.

Expected: after **Stay here**, the URL stays `/?step=1#fragment` and the draft is kept.

## Automated

```sh
npx playwright install chromium
npm test
```

`tests/repro.spec.ts` asserts the expected behaviour; it fails on the current
release. The GitHub Actions run of this repository shows the failure.
