import type { EmtConfig, EmtRow } from './engine';

export type SceneReferenceReading = {
  value: number;
  reference: number;
  ratio: number;
  delta: number;
  exceeds: boolean;
};

export function sourceStepPath(
  rows: readonly Pick<EmtRow, 'time_ms' | 'source_v'>[],
  x: (timeMs: number) => number,
  y: (voltage: number) => number,
) {
  const first = rows[0];
  if (!first) return '';

  const point = (time: number, voltage: number) => x(time).toFixed(2) + ' ' + y(voltage).toFixed(2);
  let currentVoltage = first.source_v;
  let lastPathTime = first.time_ms;
  let path = 'M' + point(first.time_ms, currentVoltage);

  for (const row of rows.slice(1)) {
    if (row.source_v === currentVoltage) continue;
    const changePoint = point(row.time_ms, row.source_v);
    path += ' L' + point(row.time_ms, currentVoltage) + ' L' + changePoint;
    currentVoltage = row.source_v;
    lastPathTime = row.time_ms;
  }

  const last = rows[rows.length - 1];
  if (last && last.time_ms > lastPathTime) path += ' L' + point(last.time_ms, currentVoltage);

  return path;
}

export function getEmtReferenceStatus(config: EmtConfig, row: EmtRow) {
  const initialCurrent = config.source_v / (config.resistance_ohm + config.load_ohm);
  const initialBusV = config.load_ohm * initialCurrent;
  const initialEnergyJ = ((0.5 * config.capacitance_mf) / 1000) * initialBusV ** 2;
  const capacitorEnergyJ = ((0.5 * config.capacitance_mf) / 1000) * row.bus_v ** 2;
  const reading = (value: number, reference: number): SceneReferenceReading => ({
    value,
    reference,
    ratio: value / Math.max(1e-9, reference),
    delta: value - reference,
    exceeds: value > reference,
  });

  return {
    bus: reading(row.bus_v, config.source_v),
    capacitor: reading(capacitorEnergyJ, initialEnergyJ),
  };
}
