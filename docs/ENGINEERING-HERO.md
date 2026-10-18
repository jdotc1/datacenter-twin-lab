# Engineering hero integration

The start view can show the verified 15-second engineering film above the existing guided experiment. `apps/web/src/EngineeringHero.tsx` registers the small vanilla `<khan-grid-hero>` adapter only after the enabled start view mounts. It requests the host stylesheet and the adapter module at that point; the video itself is created only after the visitor presses **Play animation**. The wrapper keeps a poster and explanatory text available if the adapter or film fails.

The adapter is set to `mode="video"`, with no autoplay or loop. This avoids loading Three.js into the initial application bundle. The optional standalone interactive scene in `index.html` has its own Three.js imports and is not loaded by this video integration. The film is a generic conceptual engineering animation about electro-thermal behavior, workspaces, evidence, and hybrid energy. It is illustrative only, not live telemetry, a validated facility simulation, or certified engineering evidence.

## Enable or roll back

Demo mode reads `apps/web/.env.demo`, which currently sets `VITE_ENGINEERING_HERO=1`. The Python preparation script reads that same setting when the process environment does not override it, so the complete media set is staged before Vite builds. Set `VITE_ENGINEERING_HERO=0` in the process environment to disable staging and rendering for a rollback build. Other build modes leave the feature disabled unless explicitly configured for that mode.

From the repository root, prepare the browser assets and build the demo:

```powershell
python scripts/prepare_browser_demo.py
npm.cmd --prefix apps/web run build:demo
```

With the flag enabled, preparation validates `assets/engineering-hero/v1/release-media.json`, the verified 900-frame/1920×1080/60-fps/15-second metadata, every listed path, byte count, and SHA-256, and required entry files. It stages the complete manifest-listed release, not a hand-picked subset. Vite verifies the staged files again before copying them into `dist/assets/engineering-hero/v1`. The required set includes transitive adapter dependencies `src/config.js` and `integration/vanilla/embed.css`, as well as the video, poster, adapter, host stylesheet, standalone frame, and frame CSP description.

The build emits a scoped frame policy for both `/assets/engineering-hero/v1/index.html` and `/assets/engineering-hero/v1/`. It uses the release `csp.json` policy, preserving the site's general headers. The standalone frame policy does not add `unsafe-eval`.

## Verification

The integration checks that passed locally include enabled and flag-off demo builds, `npx tsc --noEmit`, `npm run format:check`, the 63-test engine suite, the focused four-test Python staging suite, and Playwright checks for opt-in behavior, adapter lifecycle, and the 390-, 768-, and 1440-pixel responsive views. Full Python discovery passed 166 tests with 9 skipped. The responsive screenshots were captured under `.local/engineering-hero-responsive-20261018/`.

The exact standalone-frame HTTP CSP assertion cannot be verified with the local browser preview: AdGuard modifies localhost responses by injecting policy directives. The assertion remains strict; verify those headers against the deployed preview in a normal browser environment.
