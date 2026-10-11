# Infrastructure screen serialization and model proof

Infrastructure Engineering results use the separate `infrastructure-screen-1` schema. They do not use, translate to, or inherit verification badges from planning schema 1 or electrical schema 2. The typed model version is `1.0.0`; lesson content supplies its own content version and source metadata.

`calculateScreen` accepts one of the named educational models and a record containing only that model's declared inputs. It rejects unknown fields, non-finite values, invalid fractions and denominators, non-safe integer counts, invalid unit bounds, sparse stage arrays and non-finite derived outputs. It returns explicit states for relay current at or below pickup, disconnected optical paths and a nonpositive lumped thermal rise. `screenUnits` exposes the same model unit maps before a run. The release gate requires all six states—capacity, connectivity, protection, thermal, controls and evidence—to be `pass`; otherwise it returns `hold`. Even six passes return `certification: false`.

## Canonical JSON and hashes

`canonicalJson` serializes JSON-compatible values without whitespace. It sorts every object’s keys by JavaScript UTF-16 code-unit order, retains array order, and uses `JSON.stringify` number/string encoding. It rejects non-finite numbers, sparse arrays, unsupported values, non-plain objects and symbol keys. `canonicalHash(value)` is the lower-case hexadecimal SHA-256 digest of the canonical text encoded as UTF-8.

The input hash is SHA-256 of this canonical object:

```js
{
  resultSchema: 'infrastructure-screen-1',
  contentVersion: lesson.contentVersion,
  modelVersion: '1.0.0',
  lessonId: lesson.id,
  model: lesson.experiment.model,
  inputs: appliedInputs,
}
```

The result hash covers every result field except `resultHash` itself, including outputs, unit maps, assumptions, limitations, source locators and `sourceRevision`. Changing object insertion order does not change either digest; changing an applied value or result field does. Applied inputs, nested input arrays, outputs and result metadata are cloned and frozen before the result is returned. The hash identifies this educational software record; it does not establish engineering validation.

Every result explicitly names its `model`. The interactive `infrastructure-lesson-export-1` envelope preserves the completed primary `result`, separate generator `fuel` result (null in other lessons), prediction and six-criterion review snapshot. Its `exportHash` covers the canonical object `{result, fuel, prediction, review}`. Each nested screen retains its own input/result hashes; fuel inputs do not silently enter the capacity model. The envelope's fixed engineering decision is HOLD and independent engineering verification is false.

Assumptions include the model's stated screen boundary and each lesson section labelled `illustrative-assumption`. Limitations include the lesson's authored limits and the shared educational-model boundary. Source locators retain the source ID, chapter, PDF page span and evidence status. Browser/JavaScript and Python agreement is a calculation cross-check only.

## Preserved teaching edges

The generator-bank example still reports 21.6 MW available against 27 MW demand as a failed screen. The UPS example separates 375 kWh AC from about 616.78 kWh nominal. The lumped thermal screen remains 37.5 s, and the commissioning sequence totals 25 s; neither timing is a measured facility result. In the capstone, the numerical screen reports capacity and current arithmetic while the integrated release decision remains HOLD until separate evidence resolves every required criterion.

## Reproduce the focused proof

With the locked Node runtime and Python 3.12 or later, run the typed test from `apps/web` and the independent comparison from the repository root:

```powershell
node --experimental-strip-types --loader ./tests-engine/resolve-loader.mjs --test tests-engine/infrastructure.test.ts
```

```powershell
python scripts/verify_infrastructure.py
```

The first command runs the 24 supplied default/challenge cases plus validation, edge-state, serialization, hash-tamper, immutability, unit-map, source-claim, and release-gate checks. The Python script independently recomputes those 24 cases and invokes the typed TypeScript module through the repository's existing Node resolver. It checks both the supplied golden values and every independent equation result against the JavaScript output. These checks do not assess equipment, certify a design, or provide independent engineering review.

The recorded local run passed **36/36 typed tests** and **24 Python cases with 222 equation/state comparisons** on Node 24.19.0 and Python 3.12.14. The untouched kit reference also passed **38/38 Node tests** and **24 cases with 102 numeric comparisons** when run from a temporary copy; on Windows, run its Python checker with `python -X utf8` so the Unicode lesson manifest is decoded as UTF-8.
