import type { LessonEvidence, ScreenInputs } from './screens';

// The separate source fuel ledger does not infer demand from installed capacity.
export const fuelInputs: ScreenInputs = { loadKW: 27000, hours: 48, litresPerKWh: 0.25 };
export const fuelEvidence = (lesson: LessonEvidence): LessonEvidence => ({
  ...lesson,
  experiment: { model: 'fuelScreen' },
});
