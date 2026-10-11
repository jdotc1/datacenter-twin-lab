# v2.0.0 scene screenshot visual audit

Visual-only review of `datacenter-twin-lab/outputs/release-checks/scenes`. No source, tests, browser, build, server, or deployment actions were run.

## Coverage

Inspected the 33 assigned PNGs at 390, 768, and 1920 widths:

- 13 evidence-load-ledger: 768, 1920
- 14 resilience-state-matrix and 15 transformer-fault-boundaries: 390, 768, 1920
- 16 generator-bank-fuel: 390, 1920
- 17 ups-battery-station-dc, 18 protection-trip-chain, 19 grounding-power-quality: 390, 768, 1920
- 20 thermal-liquid-continuity: 390, 768
- 21 network-optical-budget, 22 facilities-phased-development, 23 commissioning-evidence-loop, 24 integrated-design-release: 390, 768, 1920

The 12 1440px screenshots and representative 13-390, 16-768, and 20-1920 were inspected separately by the parent reviewer. I did not use `24-capstone-200pct-css-zoom.png` as evidence. I read `observations.json`.

## Findings

- No clear page-level or result-ledger overflow was visible in the reviewed screenshots. `observations.json` reports `documentOverflow: false` for all 48 lesson/viewport observations and an empty `consoleErrors` list. These are recorded-run observations, not a rerun in this audit.
- At 390px, the fixed-width scene illustrations show only part of the SVG in the visible frame; the browser’s local horizontal scroll is intentional. Scene controls and the 2D result ledgers remain in-frame and present the quantities as text.
- No new false electrical connection or missing major diagram label stood out. The resilience, generator, UPS, grounding, and network illustrations visually distinguish their respective shared dependencies, separate electrical paths, trip circuit, grounding/return paths, and physical/logical routes.
- The thermal scene screenshots at 390 and 768 show the already-known crowded/overlapping SVG labels. The scenes owner is already addressing that scene; this audit does not duplicate the fix or claim the screenshots prove the new rendering.
- In `18-protection-trip-chain-390.png`, `20-thermal-liquid-continuity-768.png`, and `24-integrated-design-release-390.png`, a green “Skip to experiment” link is visible over nearby eyebrow/description copy. This appears to be a focus-state capture; static images alone cannot establish whether it obscures content only while focused or persists after activation. Verify that behavior with keyboard interaction if this remains a concern.

## Coordinator disposition after the final recapture

The initial findings above describe the earlier captures. The thermal scene owner separated its physical clock, equipment, liquid/air labels and boundary captions; the coordinator rebuilt and inspected fresh thermal images at 390, 768, 1440 and 1920 pixels plus the final before/after illustration. No overlapping thermal captions remained in those observations. The final capture repeated all 48 viewport observations with no document overflow or console errors, and added a separately identified 720 CSS-pixel reflow image.

The coordinator checked the focused skip link with keyboard activation: focus moves to `workspace-main`; the link then loses focus and returns to its hidden transform. Its temporary focused overlay is not a persistent obstruction. A separate native Chrome Settings check confirmed actual 200% zoom and usable controls without document overflow. Native scene pixel capture failed and is excluded from visual claims; separate correctly rendered 720 CSS-pixel capstone/thermal images were inspected. See [local verification](verification.md) for the exact coverage and limitation.

## Limits

This is a visual review of static Chromium screenshots plus the supplied observation file. It does not establish native browser zoom behavior, keyboard interaction, screen-reader output, general browser compatibility, engineering correctness, or WCAG conformance. No Lighthouse, FPS, or runtime performance result was measured.
